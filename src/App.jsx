import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage/HomePage";
import PratoPage from "./pages/PratoPage/PratoPage";
import PratoIngredientes from "./pages/PratoIngredientesPage/PratoIngredientes";
import ClientesPage from "./pages/ClientesPage/ClientesPage";
import EnderecosPage from "./pages/EnderecosPage/EnderecosPage";
import EstoquesPage from "./pages/EstoquesPage/EstoquesPage";
import IngredientesPage from "./pages/IngredientesPage/IngredientesPage";
import PedidosPage from "./pages/PedidosPage/PedidosPage";
import ItemPedidosPage from "./pages/ItemPedidosPage/ItemPedidosPage";
import PagamentosPage from "./pages/PagamentosPage/PagamentosPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="pratos" element={<PratoPage />} />
          <Route path="prato-ingredientes" element={<PratoIngredientes />} />
          <Route path="ingredientes" element={<IngredientesPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="enderecos" element={<EnderecosPage />} />
          <Route path="estoques" element={<EstoquesPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="itens-pedido" element={<ItemPedidosPage />} />
          <Route path="itens-pedido/:idPedido" element={<ItemPedidosPage />} />
          <Route
            path="pagamento/:idPedido/:valorTotal"
            element={<PagamentosPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
