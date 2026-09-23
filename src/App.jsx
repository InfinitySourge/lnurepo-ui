import { useEffect, useState } from 'react'


const API_URL = 'https://api.lnurepo.info';

function App() {
  const [status, setStatus] = useState({ loading: true, data: null, error: false });

  useEffect(() => {
    fetch(`${API_URL}/api/status`)
      .then((res) => {
        if (!res.ok) throw new Error('Помилка сервера');
        return res.json();
      })
      .then((data) => setStatus({ loading: false, data, error: false }))
      .catch(() => setStatus({ loading: false, data: null, error: true }));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 font-sans">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-8 text-center tracking-tight">
          LNUrepo Status
        </h1>
        
        <div className="space-y-4">
          {status.loading && (
            <div className="flex items-center justify-center space-x-2 py-4 animate-pulse">
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full delay-100"></div>
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full delay-200"></div>
              <span className="ml-3 font-medium text-blue-300">Перевірка систем...</span>
            </div>
          )}

          {!status.loading && status.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 flex items-center space-x-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Бекенд не відповідає</span>
            </div>
          )}

          {!status.loading && status.data && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-emerald-100 font-medium">API Сервер</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-blue-100 font-medium">База Даних</span>
                {status.data.database_configured ? (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold">Підключено</span>
                ) : (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-bold">Відключено</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
