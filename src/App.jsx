import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import FaqPage from './pages/FaqPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import Loading from './components/Loading.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './auth.jsx';
import { useAuth } from './auth-context.js';
function ProtectedRoute({ children }) {
  const { user, profileUnavailable, loading, unavailable, retry } = useAuth();
  if (loading) return <Loading fullPage>Перевіряємо сесію та профіль…</Loading>;
  if (unavailable) return <ErrorPage code={503} retry={retry} />;
  if (!user) return <Navigate to="/login" replace />;
  if (profileUnavailable) return <ErrorPage code={503} retry={retry} />;
  return children;
}
function ProfileRequired({ children }) {
  const { profile } = useAuth();
  return profile ? children : <Navigate to="/profile/setup" replace />;
}
export default function App() {
  return <ErrorBoundary><AuthProvider><Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/legal" element={<LegalPage />} />
    <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
    <Route path="/" element={<ProfileRequired><CatalogPage /></ProfileRequired>} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/favorites" element={<ProfileRequired><FavoritesPage /></ProfileRequired>} />
    <Route path="/profile/setup" element={<ProfilePage />} />
    <Route path="/faq" element={<FaqPage />} />
    </Route>
    <Route path="/403" element={<ErrorPage code={403} />} />
    <Route path="/500" element={<ErrorPage code={500} retry={() => window.location.reload()} />} />
    <Route path="*" element={<ErrorPage />} />
  </Routes></AuthProvider></ErrorBoundary>;
}
