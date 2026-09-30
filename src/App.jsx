import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage.jsx';
import { AuthProvider } from './auth.jsx';
import { useAuth } from './auth-context.js';

const ProtectedRoute = ({ children }) => {
  const { user, loading, unavailable } = useAuth();
  if (loading) return <p role="status">Перевіряємо сесію…</p>;
  if (unavailable) return <p role="alert">Не вдалося зв’язатися із сервером. Оновіть сторінку.</p>;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider><Routes>
      {/* Відкритий маршрут */}
      <Route path="/login" element={<AuthPage />} />

      {/* Закритий маршрут */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
    </Routes></AuthProvider>
  );
}

export default App;
