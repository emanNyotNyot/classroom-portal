/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/src/context/AuthContext';
import { Navbar } from '@/src/components/Navbar';
import Home from '@/src/pages/Home';
import Login from '@/src/pages/Login';
import Register from '@/src/pages/Register';
import Dashboard from '@/src/pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950 font-sans text-zinc-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

