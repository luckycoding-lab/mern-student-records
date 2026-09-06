import { Search, Edit3, Trash2 } from 'lucide-react';
import { CsvActions } from './CsvActions';

export default function StudentTable({
  students,
  loading,
  searchTerm,
  onSearchChange,
  onClearSearch,
  onEdit,
  onDelete,
}) {
  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl focus-within:border-blue-500 transition">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Real-time filter by city (e.g., Delhi, Mumbai)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-slate-200 placeholder-slate-500"
        />
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">City</th>
                <th className="px-5 py-3.5">GPA</th>
                <th className="px-5 py-3.5">Courses</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 bg-slate-800 rounded w-28 mb-1.5"></div>
                      <div className="h-3 bg-slate-800/60 rounded w-16"></div>
                    </td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-800 rounded w-10"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                    <td className="px-5 py-4 text-right"><div className="h-7 bg-slate-800 rounded w-14 ml-auto"></div></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No student records found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">{student.name}</div>
                      <div className="text-xs text-slate-400">{student.age} yrs</div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{student.city}</td>
                    <td className="px-5 py-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-xs font-mono">
                        {student.gpa || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.courses?.map((c, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-800 border border-slate-700/80 text-slate-300 text-xs px-2 py-0.5 rounded-md"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(student)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-lg transition cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(student._id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CsvActions />
    </div>
  );
}