import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage.jsx';

const ProtectedRoute = ({ children }) => {
  const isAuth = false; // Зміни на true, щоб побачити Dashboard
  return isAuth ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;