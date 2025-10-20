import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage/HomePage';
<<<<<<< HEAD
import PratoPage from './pages/PratoPage/PratoPage';
=======
import ClientesPage from './pages/ClientesPage/ClientesPage';
import EnderecosPage from './pages/EnderecosPage/EnderecosPage';
/* import PratoPage from './pages/PratoPage/PratoPage'; */
>>>>>>> c0353d945f8e8760a7c9baea0a45416204a8bb6b
/* import IngredientesPage from './pages/IngredientesPage';
import PedidosPage from './pages/PedidosPage'; */
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
<<<<<<< HEAD
          <Route index element={<HomePage />} />s
          <Route path="pratos" element={<PratoPage />} />
          {/* <Route path="ingredientes" element={<IngredientesPage />} />
          <Route path="clientes" element={<ClientesPage />} />
=======
          <Route index element={<HomePage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="enderecos" element={<EnderecosPage />} />
          {/* <Route path="pratos" element={<PratoPage />} />
          <Route path="ingredientes" element={<IngredientesPage />} />
>>>>>>> c0353d945f8e8760a7c9baea0a45416204a8bb6b
          <Route path="pedidos" element={<PedidosPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;