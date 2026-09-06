import { GraduationCap } from 'lucide-react';

export default function Header({ totalCount }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 pb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <GraduationCap className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Record System</h1>
          <p className="text-sm text-slate-400">Full-Stack Database Dashboard</p>
        </div>
      </div>
      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1 rounded-full text-xs font-semibold">
        {totalCount} Total Records
      </span>
    </header>
  );
}