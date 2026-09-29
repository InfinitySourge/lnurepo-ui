import { Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import BoardPage from './pages/BoardPage.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<BoardPage />} />
    </Routes>
  );
}

export default App;
