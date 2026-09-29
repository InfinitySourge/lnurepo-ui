import { useEffect, useState } from 'react';

const API_URL = 'https://api.lnurepo.info';

async function requestJson(endpoint, options) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function getMessages() {
  const messages = await requestJson('/api/messages');
  return Array.isArray(messages) ? messages : [];
}

function BoardPage() {
  const [status, setStatus] = useState({
    loading: true,
    data: null,
    error: false,
  });
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [diagnosticLog, setDiagnosticLog] = useState('Очікування тесту...');

  useEffect(() => {
    let isMounted = true;

    requestJson('/api/status')
      .then((data) => {
        if (isMounted) setStatus({ loading: false, data, error: false });
      })
      .catch(() => {
        if (isMounted) setStatus({ loading: false, data: null, error: true });
      });

    getMessages()
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((error) => {
        console.error('Messages fetch error:', error);
        if (isMounted) setMessages([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSendMessage(event) {
    event.preventDefault();
    const content = inputValue.trim();
    if (!content || isSending) return;

    setIsSending(true);
    try {
      await requestJson('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setInputValue('');
      setMessages(await getMessages());
    } catch (error) {
      alert(`Не вдалося відправити. ${error.message}`);
    } finally {
      setIsSending(false);
    }
  }

  async function runTest(endpoint) {
    setDiagnosticLog(`Пінг ${endpoint}...`);
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      const text = await response.text();
      setDiagnosticLog(`Статус: ${response.status}\nВідповідь: ${text}`);
    } catch (error) {
      setDiagnosticLog(`Помилка підключення: ${error.message}`);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 font-sans">
      <div className="w-full max-w-3xl">
        <section className="mb-6 rounded-xl border border-yellow-600 bg-yellow-900/30 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-yellow-400">
            <span>🛠 Інженерна панель (режим розробки)</span>
          </h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-xs text-white hover:bg-gray-700"
              onClick={() => runTest('/')}
              type="button"
            >
              Перевірити / (головна)
            </button>
            <button
              className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-xs text-white hover:bg-gray-700"
              onClick={() => runTest('/api/status')}
              type="button"
            >
              Перевірити /api/status
            </button>
            <button
              className="rounded border border-blue-600 bg-blue-900 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
              onClick={() => runTest('/api/debug')}
              type="button"
            >
              Перевірити /api/debug
            </button>
            <button
              className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-xs text-white hover:bg-gray-700"
              onClick={() => runTest('/api/messages')}
              type="button"
            >
              Перевірити /api/messages
            </button>
          </div>
          <pre className="min-h-[60px] break-all whitespace-pre-wrap rounded bg-black/50 p-3 font-mono text-xs text-green-400">
            {diagnosticLog}
          </pre>
        </section>

        <section className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
          <header className="mb-8 flex items-center justify-between border-b border-gray-700 pb-4">
            <h1 className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-3xl font-extrabold text-transparent">
              LNUrepo Board
            </h1>
            <div className="flex items-center space-x-2">
              {!status.loading && status.data && (
                <span className="flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  БД:{' '}
                  {status.data.database_configured
                    ? 'Підключено'
                    : 'Не налаштовано'}
                </span>
              )}
              {!status.loading && status.error && (
                <span className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
                  Недоступна
                </span>
              )}
            </div>
          </header>

          <form className="mb-8" onSubmit={handleSendMessage}>
            <div className="flex gap-3">
              <input
                className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSending}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Введіть текст..."
                type="text"
                value={inputValue}
              />
              <button
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                disabled={isSending || !inputValue.trim()}
                type="submit"
              >
                {isSending ? '...' : 'Надіслати'}
              </button>
            </div>
          </form>

          <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-700 py-8 text-center text-gray-500">
                База даних порожня. Будь першим, хто залишить повідомлення!
              </div>
            ) : (
              messages.map((message) => (
                <article
                  className="rounded-2xl border border-gray-700 bg-gray-750 p-4"
                  key={message.id}
                >
                  <p className="break-words text-gray-200">{message.content}</p>
                  <time className="mt-2 block text-xs text-gray-500">
                    ID: {message.id} •{' '}
                    {new Date(message.created_at).toLocaleString('uk-UA')}
                  </time>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default BoardPage;
