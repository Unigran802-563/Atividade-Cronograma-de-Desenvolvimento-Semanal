import { NavLink } from "react-router-dom";
// 1. Importe os ícones que você vai usar
import {
  FaHome,
  FaUtensils,
  FaCarrot,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">SOS Restaurante</h2>
        <p className="sidebar-subtitle">Sistema de Gerenciamento</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          end
        >
          {/* 2. Substitua o emoji pelo componente do ícone */}
          <span className="nav-icon">
            <FaHome />
          </span>
          <span className="nav-text">Home</span>
        </NavLink>

        <NavLink
          to="/pratos"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">
            <FaUtensils />
          </span>
          <span className="nav-text">Pratos</span>
        </NavLink>

        <NavLink
          to="/ingredientes"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">
            <FaCarrot />
          </span>
          <span className="nav-text">Ingredientes</span>
        </NavLink>

        <NavLink
          to="/clientes"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">
            <FaUsers />
          </span>
          <span className="nav-text">Clientes</span>
        </NavLink>

        <NavLink
          to="/enderecos"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">📍</span>
          <span className="nav-text">Endereços</span>
        </NavLink>

        <NavLink
          to="/pedidos"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">
            <FaClipboardList />
          </span>
          <span className="nav-text">Pedidos</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>© 2025 SOS Restaurante</p>
      </div>
    </aside>
  );
}

export default Sidebar;
