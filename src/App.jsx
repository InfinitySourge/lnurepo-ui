import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import Loading from './components/Loading.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './auth.jsx';
import { useAuth } from './auth-context.js';
function ProtectedRoute({ children, onboarding = false }) {
  const { user, profile, profileUnavailable, loading, unavailable, retry } = useAuth();
  if (loading) return <Loading fullPage>Перевіряємо сесію та профіль…</Loading>;
  if (unavailable) return <ErrorPage code={503} retry={retry} />;
  if (!user) return <Navigate to="/login" replace />;
  if (onboarding && !profile && !profileUnavailable) return <Navigate to="/profile/setup" replace />;
  return children;
}
export default function App() {
  return <ErrorBoundary><AuthProvider><Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/" element={<ProtectedRoute onboarding><HomePage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/profile/setup" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/403" element={<ErrorPage code={403} />} />
    <Route path="/500" element={<ErrorPage code={500} retry={() => window.location.reload()} />} />
    <Route path="*" element={<ErrorPage />} />
  </Routes></AuthProvider></ErrorBoundary>;
}
