import { useState } from 'react';
import { X } from 'lucide-react';

export default function EditStudentModal({ student, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: student.name || '',
    age: student.age || '',
    city: student.city || '',
    gpa: student.gpa || '',
    courses: student.courses ? student.courses.join(', ') : '',
    hasAdhaarCard: student.idCards?.hasAdhaarCard ?? true,
    hasPenCard: student.idCards?.hasPenCard ?? false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onUpdate(student._id, {
      name: formData.name.trim(),
      age: Number(formData.age),
      city: formData.city.trim(),
      gpa: Number(formData.gpa),
      courses: formData.courses.split(',').map((c) => c.trim()).filter(Boolean),
      idCards: {
        hasAdhaarCard: formData.hasAdhaarCard,
        hasPenCard: formData.hasPenCard,
      },
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Edit Student Record</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Age</label>
              <input
                type="number"
                required
                min="16"
                max="60"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">GPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">City</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Courses</label>
            <input
              type="text"
              value={formData.courses}
              onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.hasAdhaarCard}
                onChange={(e) => setFormData({ ...formData, hasAdhaarCard: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-blue-500"
              />
              Aadhaar Card
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.hasPenCard}
                onChange={(e) => setFormData({ ...formData, hasPenCard: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-blue-500"
              />
              PAN Card
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}