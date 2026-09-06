export const LoginScreen = () => {
  const handleGoogleLogin = () => {
    // Redirect browser directly to backend OAuth entrypoint
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
        {/* Brand Icon / Title */}
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
          🎓
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Student Record System
        </h2>
        <p className="text-sm text-slate-400 mb-8">
          Sign in with your authorized Google account to manage student databases, run aggregations, and process bulk CSV records.
        </p>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl shadow-md transition duration-150 active:scale-[0.98]"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google G"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="text-xs text-slate-500 mt-6">
          Secured with HTTP-Only JSON Web Tokens & OAuth 2.0
        </p>
      </div>
    </div>
  );
};