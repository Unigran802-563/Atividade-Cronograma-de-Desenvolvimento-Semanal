import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import './MainLayout.css';

function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;

