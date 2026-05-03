import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet /> {/* Aquí se renderizarán las páginas (Dashboard, Students, etc.) */}
      </main>
    </div>
  );
};

export default MainLayout;