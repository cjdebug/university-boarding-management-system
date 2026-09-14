import { Outlet } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";
import TopNavbar from "./TopNavbar";

function OwnerLayout() {
  return (
    <div className="app-layout">
      <OwnerSidebar />

      <div className="main-area">
        <TopNavbar userType="owner" />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OwnerLayout;
