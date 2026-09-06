import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}