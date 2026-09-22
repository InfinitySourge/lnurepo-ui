import { useEffect, useState } from 'react'

function App() {
  const [serverStatus, setServerStatus] = useState("Перевірка зв'язку...")

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setServerStatus("Бекенд підключено 🚀 | БД налаштована: " + (data.database_configured ? "Так" : "Ні"))
        }
      })
      .catch(() => setServerStatus("Бекенд не відповідає ❌"))
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-10 bg-white rounded-2xl shadow-xl border border-gray-200 text-center">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4">LNUrepo</h1>
        <div className="inline-block px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg font-medium text-gray-700">
            {serverStatus}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App