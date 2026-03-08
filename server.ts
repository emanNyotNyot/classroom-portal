import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

const port = process.env.PORT ||8080;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://upmtdyxdiripnzcdlsng.supabase.co';
// Use the service role key to bypass all RLS and permissions issues
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwbXRkeXhkaXJpcG56Y2Rsc25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MzQ5MSwiZXhwIjoyMDg4MTY5NDkxfQ.xOj6nsc4tuSoLKDbZn8s8JNfFjUnhtvxNe09FX_0s7Q'; // Placeholder, will be replaced by user

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function startServer() {
  const app = express();
  // Use the PORT environment variable (Render provides this), fallback to 3000
  const PORT = parseInt(process.env.PORT || process.env.port || '3000', 10);

  app.use(express.json());
  app.use(cookieParser());

  // Middleware to verify JWT
  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, role, class_name')
        .eq('id', decoded.id)
        .single();
        
      if (error || !user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      (req as any).user = user;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // API Routes
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, address, class_name } = req.body;
    if (!name || !email || !password || !role || !class_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const cleanClassName = class_name.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('users')
        .insert([{ name, email: cleanEmail, password: hashedPassword, role, address: address || null, class_name: cleanClassName }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(400).json({ error: 'Email already exists' });
        }
        throw error;
      }
      
      const token = jwt.sign({ id: data.id, role, class_name: cleanClassName }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ id: data.id, name, email: cleanEmail, role, class_name: cleanClassName });
    } catch (err: any) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();
      
      if (error || !user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role, class_name: user.class_name }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, class_name: user.class_name, address: user.address });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/auth/me', authenticate, async (req, res) => {
    const userId = (req as any).user.id;
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, address, class_name')
        .eq('id', userId)
        .single();
        
      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ success: true });
  });

  // Get students in the same class
  app.get('/api/students', authenticate, async (req, res) => {
    const user = (req as any).user;
    
    if (!user.class_name) {
      return res.status(400).json({ error: 'No class_name found in user session. Please log out and log back in.' });
    }
    
    try {
      const cleanClassName = user.class_name.trim();
      
      // Now fetch the specific students
      const { data: students, error } = await supabase
        .from('users')
        .select('id, name, email, address, class_name, role')
        .ilike('role', 'student')
        .ilike('class_name', cleanClassName);
        
      if (error) {
        console.error('Supabase Error Details:', error);
        throw error;
      }
      
      res.json(students || []);
    } catch (err) {
      console.error('Fetch students error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Add a new student (Lecturer only)
  app.post('/api/students', authenticate, async (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'lecturer') {
      return res.status(403).json({ error: 'Only lecturers can add students' });
    }

    if (!user.class_name) {
      return res.status(400).json({ error: 'No class_name found in user session. Please log out and log back in.' });
    }

    const { name, email, password, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const cleanClassName = user.class_name.trim();
      const cleanEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          name, 
          email: cleanEmail, 
          password: hashedPassword, 
          role: 'student', 
          address: address || null, 
          class_name: cleanClassName 
        }])
        .select('id, name, email, address, class_name, role')
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(400).json({ error: 'Email already exists' });
        }
        throw error;
      }

      res.status(201).json(data);
    } catch (err) {
      console.error('Add student error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Update student (Lecturer only)
  app.put('/api/students/:id', authenticate, async (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'lecturer') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (!user.class_name) {
      return res.status(400).json({ error: 'No class_name found in user session. Please log out and log back in.' });
    }
    
    const studentId = req.params.id;
    const { name, email, address } = req.body;
    
    try {
      const cleanClassName = user.class_name.trim();
      const { data, error } = await supabase
        .from('users')
        .update({ name, email, address })
        .eq('id', studentId)
        .ilike('role', 'student')
        .ilike('class_name', cleanClassName)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Student not found or not in your class' });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Delete student (Lecturer only)
  app.delete('/api/students/:id', authenticate, async (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'lecturer') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (!user.class_name) {
      return res.status(400).json({ error: 'No class_name found in user session. Please log out and log back in.' });
    }
    
    const studentId = req.params.id.trim();
    
    try {
      const cleanClassName = user.class_name.trim();
      console.log(`Attempting to delete student ${studentId} from class ${cleanClassName}`);
      
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', studentId)
        .ilike('role', 'student')
        .ilike('class_name', cleanClassName)
        .select();
        
      console.log('Delete response:', { data, error });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Student not found or not in your class' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, the compiled server is in dist-server, so we need to go up to find dist
    const distPath = path.join(__dirname, '..', 'dist');
    // Serve static files from dist folder
    app.use(express.static(distPath));
    
    // Handle SPA routing - serve index.html for all routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
