import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

export default function StudentForm({ onCreate }) {
  const initialFormState = {
    name: '',
    age: '',
    city: '',
    gpa: '',
    courses: '',
    hasPenCard: false,
    hasAdhaarCard: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      name: formData.name.trim(),
      age: Number(formData.age),
      city: formData.city.trim(),
      gpa: formData.gpa ? Number(formData.gpa) : 0,
      courses: formData.courses ? formData.courses.split(',').map((c) => c.trim()).filter(Boolean) : [],
      idCards: {
        hasPenCard: formData.hasPenCard,
        hasAdhaarCard: formData.hasAdhaarCard,
      },
    });
    setFormData(initialFormState);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-400" /> Add Student
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-medium">Full Name</label>
          <input
            type="text"
            required
            placeholder="e.g., Lucky Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium">Age</label>
            <input
              type="number"
              required
              min="16"
              max="60"
              placeholder="23"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">GPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="8.5"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium">City</label>
          <input
            type="text"
            required
            placeholder="e.g., Delhi"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium">Courses (comma separated)</label>
          <input
            type="text"
            placeholder="React, NodeJS, MongoDB"
            value={formData.courses}
            onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasAdhaarCard}
              onChange={(e) => setFormData({ ...formData, hasAdhaarCard: e.target.checked })}
              className="rounded border-slate-800 bg-slate-950 text-blue-500"
            />
            Aadhaar Card
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasPenCard}
              onChange={(e) => setFormData({ ...formData, hasPenCard: e.target.checked })}
              className="rounded border-slate-800 bg-slate-950 text-blue-500"
            />
            PAN Card
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition text-sm cursor-pointer shadow-lg shadow-blue-600/20"
        >
          Insert Record
        </button>
      </form>
    </div>
  );
}