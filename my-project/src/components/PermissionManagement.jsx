import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axiosInstance";
import { toast } from "react-hot-toast";
import {
  Trash2,
  Shield,
  UserCheck,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import Sidebar from "./Sidebar";

const PermissionManagement = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]); // Ensure permissions are initialized as an empty array
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const permissionsRes = await api.get("Permissions/roles-with-permissions");
      setPermissions(permissionsRes.data || []); // Ensure empty array if no data
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to fetch permissions ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleAssignPermission = () => {
    navigate("/assign-permission");
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar activePage="/permissionmanagement" />

      {/* Main Content */}
      <div className="w-4/5 bg-gray-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Permission Management</h1>
              <p className="text-gray-500 mt-2">Manage roles and their assigned permissions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAssignPermission}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
              >
                <UserCheck size={18} />
                <span>Assign Permission</span>
              </button>
              <button
                onClick={() => navigate("/remove-permission")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
              >
                <Trash2 size={18} />
                <span>Delete Permission</span>
              </button>
              <button
                onClick={() => navigate("/userlist")}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
              >
                <ChevronLeft size={18} />
                <span>Back to Users</span>
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Role Permissions</h2>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading permissions...</p>
                  </div>
                </div>
              ) : (
                <>
                  {permissions.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <AlertCircle size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Permissions Found</h3>
                      <p className="text-gray-500 max-w-md">
                        No roles with permissions have been configured yet. Click "Assign Permission" to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Role Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Permissions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {permissions.map((permission, index) => (
                            <tr key={`${permission.roleName}-${index}`} className="hover:bg-blue-50 transition-colors duration-150">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-800">{permission.roleName}</div>
                              </td>
                              <td className="px-6 py-4">
                                {permission.permissions && permission.permissions.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {permission.permissions.map((perm, i) => (
                                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {perm}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">No permissions assigned</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;