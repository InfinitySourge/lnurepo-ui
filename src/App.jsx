import { useEffect, useState } from 'react';

const API_URL = 'https://api.lnurepo.info';

function App() {
  const [status, setStatus] = useState({ loading: true, data: null, error: false });
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Стан для діагностичної панелі
  const [diagnosticLog, setDiagnosticLog] = useState("Очікування тесту...");

  useEffect(() => {
    fetch(`${API_URL}/api/status`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setStatus({ loading: false, data, error: false }))
      .catch(() => setStatus({ loading: false, data: null, error: true }));

    fetchMessages();
  }, []);

  const fetchMessages = () => {
    fetch(`${API_URL}/api/messages`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
        else setMessages([]);
      })
      .catch((err) => {
        console.error("Messages fetch error:", err);
        setMessages([]);
      });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSending(true);
    fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: inputValue })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        setInputValue("");
        fetchMessages();
      })
      .catch(err => alert(`Не вдалося відправити. ${err.message}`))
      .finally(() => setIsSending(false));
  };

  // --- ДІАГНОСТИЧНІ ФУНКЦІЇ ..---
  const runTest = async (endpoint) => {
    setDiagnosticLog(`Пінг ${endpoint}...`);
    try {
      const res = await fetch(`${API_URL}${endpoint}`);
      const text = await res.text();
      setDiagnosticLog(`Статус: ${res.status}\nВідповідь: ${text}`);
    } catch (err) {
      setDiagnosticLog(`Помилка підключення: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 font-sans p-4">
      <div className="w-full max-w-3xl">
        
        {/* --- ПАНЕЛЬ ДІАГНОСТИКИ --- */}
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4 mb-6">
          <h2 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
            <span>🛠 Інженерна панель (Dev Mode)</span>
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => runTest('/')} className="bg-gray-800 hover:bg-gray-700 text-xs text-white py-2 px-3 rounded border border-gray-600">Test / (Root)</button>
            <button onClick={() => runTest('/api/status')} className="bg-gray-800 hover:bg-gray-700 text-xs text-white py-2 px-3 rounded border border-gray-600">Test /api/status</button>
            <button onClick={() => runTest('/api/debug')} className="bg-blue-900 hover:bg-blue-800 text-xs text-white py-2 px-3 rounded border border-blue-600 font-bold">Test /api/debug</button>
            <button onClick={() => runTest('/api/messages')} className="bg-gray-800 hover:bg-gray-700 text-xs text-white py-2 px-3 rounded border border-gray-600">Test /api/messages</button>
          </div>
          <pre className="bg-black/50 text-green-400 p-3 rounded text-xs font-mono whitespace-pre-wrap break-all min-h-[60px]">
            {diagnosticLog}
          </pre>
        </div>

        {/* --- ГОЛОВНИЙ ДОДАТОК --- */}
        <div className="p-8 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700">
          <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
              LNUrepo Board
            </h1>
            <div className="flex items-center space-x-2">
              {!status.loading && status.data && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  DB: {status.data.database_configured ? "OK" : "NO URL"}
                </span>
              )}
              {!status.loading && status.error && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold">Offline</span>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Введіть текст..."
                className="flex-1 bg-gray-900 text-gray-100 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50"
              >
                {isSending ? "..." : "Надіслати"}
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-700 rounded-2xl">
                База даних порожня. Будь першим, хто залишить повідомлення!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-4 bg-gray-750 border border-gray-700 rounded-2xl">
                  <p className="text-gray-200 break-words">{msg.content}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    ID: {msg.id} • {new Date(msg.created_at).toLocaleString('uk-UA')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
