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
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, authLoading, logout } = useAuth();

  // App & Data States
  const [students, setStudents] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Search & Edit States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  // Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Students when authenticated
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const fetchStudents = async () => {
      try {
        setTableLoading(true);
        setError(null);
        const data = await getStudentsAPI(
          debouncedSearch ? { city: debouncedSearch } : {}
        );
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

  // 1. Auth Gate: Wait for token validation before doing anything
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-xs text-slate-500">Verifying session...</p>
      </div>
    );
  }

  // 2. Auth Gate: If validation finished and no user, show login screen
  if (!user) {
    return <LoginScreen />;
  }

  const userImage = user?.avatar || user?.image || user?.picture;
  const displayName = user?.displayName || user?.name || user?.email || 'User';

  return (
    <div className="min-h-screen bg-gray-900 text-slate-100 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <Toast message={toast} />

        {/* User Session Bar */}
        <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-3">
            {userImage ? (
              <img
                src={userImage}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                {displayName.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium text-slate-200">
              {displayName}
            </span>
          </div>
          <button
            onClick={logout}
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