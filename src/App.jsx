
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage/HomePage';
/* import PratoPage from './pages/PratoPage/PratoPage'; */
/* import IngredientesPage from './pages/IngredientesPage';
import ClientesPage from './pages/ClientesPage';
import PedidosPage from './pages/PedidosPage'; */
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />s
          {/* <Route path="pratos" element={<PratoPage />} />
          <Route path="ingredientes" element={<IngredientesPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="pedidos" element={<PedidosPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

