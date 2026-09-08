// Resolve the base URL using VITE_API_URL configured in Vercel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_URL}/api`;

export const getStudentsAPI = async (filters = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== '')
  );
  const queryParams = new URLSearchParams(cleanFilters).toString();
  const endpoint = queryParams ? `${BASE_URL}/students?${queryParams}` : `${BASE_URL}/students`;

  const res = await fetch(endpoint, {
    credentials: 'include', // Ensures the auth session cookie is passed
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch students');
  return data.data;
};

export const createStudentAPI = async (studentData) => {
  const res = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(studentData),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.errors ? data.errors.map((e) => e.message).join(', ') : data.message;
    throw new Error(errorMsg || 'Failed to create student');
  }
  return data.data;
};

export const updateStudentAPI = async (id, updatedData) => {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatedData),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.errors ? data.errors.map((e) => e.message).join(', ') : data.message;
    throw new Error(errorMsg || 'Failed to update student');
  }
  return data.data;
};

export const deleteStudentAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete student');
  return data;
};

// Trigger CSV Export Download
export const exportStudentCSV = async () => {
  const response = await fetch(`${BASE_URL}/students/export/csv?t=${Date.now()}`, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) throw new Error('Failed to export CSV');

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `students_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

// Upload and Import CSV
export const importStudentsFromCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/students/import/csv`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'CSV Import Failed');
  }
  return data;
};