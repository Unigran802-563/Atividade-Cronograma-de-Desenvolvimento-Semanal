import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage/HomePage';
import PratoPage from './pages/PratoPage/PratoPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<MainLayout />}>
          {/* Rota filha que usa MainLayout */}
          <Route index element={<HomePage />} />
          <Route path="pratos" element={<PratoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
