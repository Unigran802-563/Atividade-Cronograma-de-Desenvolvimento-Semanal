import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUtensils,
  FaCarrot,
  FaUsers,
  FaClipboardList,
  FaLocationArrow,
  FaBoxes,
  FaListAlt,
  FaReceipt,
} from "react-icons/fa";
import "./SideBar.css";

// Componente reutilizável para os itens de navegação
const NavItem = ({ to, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
    end={to === "/"}
  >
    <span className="nav-icon">{icon}</span>
    <span className="nav-text">{children}</span>
  </NavLink>
);

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">SOS Restaurante</h2>
        <p className="sidebar-subtitle">Sistema de Gerenciamento</p>
      </div>

      <nav className="sidebar-nav">
        <NavItem to="/" icon={<FaHome />}>
          Home
        </NavItem>
        <NavItem to="/pratos" icon={<FaUtensils />}>
          Pratos
        </NavItem>
        <NavItem to="/prato-ingredientes" icon={<FaListAlt />}>
          Prato Ingredientes
        </NavItem>
        <NavItem to="/ingredientes" icon={<FaCarrot />}>
          Ingredientes
        </NavItem>
        <NavItem to="/clientes" icon={<FaUsers />}>
          Clientes
        </NavItem>
        <NavItem to="/enderecos" icon={<FaLocationArrow />}>
          Endereços
        </NavItem>
        <NavItem to="/estoques" icon={<FaBoxes />}>
          Estoque
        </NavItem>
        <NavItem to="/pedidos" icon={<FaClipboardList />}>
          Pedidos
        </NavItem>
        <NavItem to="/itens-pedido" icon={<FaReceipt />}>
          Itens do Pedido
        </NavItem>
      </nav>

      <div className="sidebar-footer">
        <p>© 2025 SOS Restaurante</p>
        <h3>Equipe:</h3>
        <ul>
          <li>Caren Naomi Aguero Ito</li>
          <li>Flávia Teruya de Oliveira</li>
          <li>João Gustavo Paiva Deboleto</li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
