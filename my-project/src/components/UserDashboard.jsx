import React from "react";
import Sidebar from "./Sidebar"; // Adjust path if it's in another folder

const UserDashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <Sidebar activePage="/userdashboard" />

      {/* Main content area */}
      <div className="w-4/5 p-10 bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome 👋</h1>
<p className="text-lg text-gray-600">
  You're logged in as <strong>{localStorage.getItem("roleName")}</strong>. Use the sidebar to navigate
  through your dashboard.
</p>

      </div>
    </div>
  );
};

export default UserDashboard;
