import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/button';
import { useAuth } from '@/src/context/AuthContext';
import { motion } from 'motion/react';
import { BookOpen, Users, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col bg-zinc-950 text-zinc-50">
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Manage Your Classroom <br className="hidden sm:inline" />
                  <span className="text-indigo-500">With Ease</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-400 md:text-xl">
                  The all-in-one portal for students and lecturers. Connect with classmates, manage student information, and streamline your academic journey.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-x-4"
              >
                {user ? (
                  <Link to="/dashboard">
                    <Button className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="h-12 px-8 text-lg border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-zinc-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
                  <Users className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold">Connect with Classmates</h3>
                <p className="text-zinc-400">Students can easily view and connect with others in their class.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
                  <BookOpen className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold">Manage Students</h3>
                <p className="text-zinc-400">Lecturers have full control to view, edit, or remove students from their classes.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
                  <ShieldCheck className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold">Secure Access</h3>
                <p className="text-zinc-400">Role-based authentication ensures data privacy and secure access for everyone.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
