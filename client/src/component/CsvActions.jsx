import { useRef, useState } from 'react';
import { exportStudentCSV, importStudentsFromCSV } from '../api/studentApi';

export const CsvActions = ({ onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportStudentCSV();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await importStudentsFromCSV(file);
      alert(res.message);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="flex justify-end gap-3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Export Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleExport}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
      >
        Export CSV
      </button>

      {/* Import Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Import CSV'}
      </button>
    </div>
  );
};