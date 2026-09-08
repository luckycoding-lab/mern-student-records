import { useState, useEffect } from 'react';
import {
  getStudentsAPI,
  createStudentAPI,
  updateStudentAPI,
  deleteStudentAPI,
} from './api/studentApi';
import Header from './component/Header';
import Toast from './component/Toast';
import StudentForm from './component/StudentForm';
import StudentTable from './component/StudentTable';
import EditStudentModal from './component/EditStudentModal';
import { LoginScreen } from './component/LoginScreen';
import { AlertCircle, LogOut } from 'lucide-react';

// Move API_URL outside the component scope
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App & Data States
  const [students, setStudents] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Search & Edit States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  // 1. Session Verification on Mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // ✅ FIXED: Use backticks (`) instead of single quotes (')
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // Sends HTTP-only cookie
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // 2. Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 3. Fetch Student Records (Only runs if user is authenticated)
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchStudents = async () => {
      try {
        setTableLoading(true);
        setError(null);
        const data = await getStudentsAPI(debouncedSearch ? { city: debouncedSearch } : {});
        if (isMounted) setStudents(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setTableLoading(false);
      }
    };

    fetchStudents();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, user]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCreate = async (payload) => {
    try {
      setError(null);
      const newStudent = await createStudentAPI(payload);
      setStudents((prev) => [newStudent, ...prev]);
      showToast('Student record created successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, updatedPayload) => {
    try {
      const updated = await updateStudentAPI(id, updatedPayload);
      setStudents((prev) => prev.map((s) => (s._id === id ? updated : s)));
      setEditingStudent(null);
      showToast('Student record updated!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudentAPI(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      showToast('Student record removed.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Auth Gate: Session Check Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Auth Gate: Unauthenticated Login Screen
  if (!user) {
    return <LoginScreen />;
  }

  // Authenticated Main Dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-slate-100 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <Toast message={toast} />

        {/* User Session Bar */}
        <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user?.avatar || user?.image}
                alt={user?.name || 'User Avatar'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-indigo-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                {user.displayName?.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-slate-200">
              {user.displayName || user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>

        <Header totalCount={students.length} />

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StudentForm onCreate={handleCreate} />
          <StudentTable
            students={students}
            loading={tableLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
            onEdit={setEditingStudent}
            onDelete={handleDelete}
          />
        </div>

        {editingStudent && (
          <EditStudentModal
            student={editingStudent}
            onClose={() => setEditingStudent(null)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}