import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import GlobalLoader from "../components/GlobalLoader"; // adjust path as needed

const UserDashboard = () => {
  const [loading, setLoading] = useState(true); // global loading state
  const roleName = localStorage.getItem("roleName") || "Guest";

  // Simulated data
  const totalUsers = 40;
  const totalRoles = 8;

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <GlobalLoader message="Loading dashboard..." />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/userdashboard" />

      <div className="w-4/5 p-10 bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome 👋</h1>
          <p className="text-lg text-gray-600">
            You're logged in as <strong>{roleName}</strong>. Use the sidebar to navigate your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-xl transition-all duration-300">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a4 4 0 00-5-4m-6 6v-2a4 4 0 00-5-4 4 4 0 00-5 4v2h5m4-10a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 10-8 0 4 4 0 008 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-xl transition-all duration-300">
            <div className="bg-green-100 text-green-600 p-4 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 10h18M3 6h18M3 14h18M3 18h18" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Roles</h3>
              <p className="text-2xl font-bold text-green-600">{totalRoles}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

