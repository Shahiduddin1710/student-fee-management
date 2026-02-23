import { NavLink } from "react-router-dom";
import "./layout.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">VCET</div>

      <div className="nav-section">
        <NavLink to="/dashboard" className="nav-item">
          Dashboard
        </NavLink>
      </div>

      <div className="nav-section-title">Students</div>

      <div className="nav-section">
        <NavLink to="/students" className="nav-item">
          View Students
        </NavLink>

        <NavLink to="/add-student" className="nav-item">
          Add Student
        </NavLink>
      </div>

      <div className="nav-section">
        <NavLink to="/fees" className="nav-item">
          Fees
        </NavLink>

        <NavLink to="/reports" className="nav-item">
          Reports
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;