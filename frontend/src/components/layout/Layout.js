import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-section">
        <Topbar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;