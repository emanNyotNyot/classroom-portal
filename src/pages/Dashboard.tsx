import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { motion } from 'motion/react';
import { User, Mail, MapPin, Trash2, Edit2, X, Check, Plus } from 'lucide-react';

type Student = {
  id: number;
  name: string;
  email: string;
  address: string;
  class_name: string;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', address: '' });
  
  // Add Student State
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', address: '' });
  const [addError, setAddError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/students?t=${new Date().getTime()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        const errData = await res.json();
        alert('Error fetching students: ' + (errData.error || res.statusText));
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
      alert('Failed to fetch students: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();

      if (res.ok) {
        setStudents([...students, data]);
        setIsAdding(false);
        setAddForm({ name: '', email: '', password: '', address: '' });
      } else {
        setAddError(data.error || 'Failed to add student');
      }
    } catch (err) {
      setAddError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStudents(students.filter(s => s.id !== id));
      } else {
        const errData = await res.json();
        alert('Error deleting student: ' + (errData.error || res.statusText));
      }
    } catch (err) {
      console.error('Failed to delete student', err);
      alert('Failed to delete student: ' + err);
    }
  };

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditForm({ name: student.name, email: student.email, address: student.address });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      if (res.ok) {
        setStudents(students.map(s => s.id === id ? { ...s, ...editForm } : s));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to update student', err);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-50">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-zinc-950 p-6 text-zinc-50">
      <div className="mx-auto max-w-5xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-400">
            {user.role === 'lecturer' 
              ? `Manage students in class ${user.class_name}`
              : `View your classmates in ${user.class_name}`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-zinc-800 bg-zinc-900 text-zinc-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{user.role === 'lecturer' ? 'Class Roster' : 'Classmates'}</CardTitle>
                <CardDescription className="text-zinc-400">
                  {students.length} {students.length === 1 ? 'student' : 'students'} found.
                </CardDescription>
              </div>
              {user.role === 'lecturer' && (
                <Button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isAdding ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  {isAdding ? 'Cancel' : 'Add Student'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isAdding && (
                <Card className="mb-6 border-zinc-800 bg-zinc-950/50 text-zinc-50">
                  <CardContent className="p-4">
                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Name</label>
                          <Input
                            required
                            value={addForm.name}
                            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                            className="border-zinc-700 bg-zinc-900 text-zinc-50"
                            placeholder="Student Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Email</label>
                          <Input
                            required
                            type="email"
                            value={addForm.email}
                            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                            className="border-zinc-700 bg-zinc-900 text-zinc-50"
                            placeholder="student@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Password</label>
                          <Input
                            required
                            type="password"
                            value={addForm.password}
                            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                            className="border-zinc-700 bg-zinc-900 text-zinc-50"
                            placeholder="Initial password"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Address (Optional)</label>
                          <Input
                            value={addForm.address}
                            onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                            className="border-zinc-700 bg-zinc-900 text-zinc-50"
                            placeholder="Student Address"
                          />
                        </div>
                      </div>
                      {addError && <p className="text-sm text-red-400">{addError}</p>}
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          {isSubmitting ? 'Adding...' : 'Save Student'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="py-8 text-center text-zinc-500">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">No students found in this class.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {students.map((student) => (
                    <Card key={student.id} className="border-zinc-800 bg-zinc-950/50 text-zinc-50">
                      <CardContent className="p-4">
                        {editingId === student.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="h-8 border-zinc-700 bg-zinc-900 text-zinc-50"
                              placeholder="Name"
                            />
                            <Input
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="h-8 border-zinc-700 bg-zinc-900 text-zinc-50"
                              placeholder="Email"
                            />
                            <Input
                              value={editForm.address}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              className="h-8 border-zinc-700 bg-zinc-900 text-zinc-50"
                              placeholder="Address"
                            />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-50">
                                <X className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => saveEdit(student.id)} className="h-8 w-8 p-0 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 font-medium">
                                <User className="h-4 w-4 text-indigo-400" />
                                {student.name}
                                {student.id === user.id && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full ml-2">You</span>}
                              </div>
                              {user.role === 'lecturer' && (
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => startEdit(student)} className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-50">
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete(student.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-zinc-400">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">{student.address || 'No address provided'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
