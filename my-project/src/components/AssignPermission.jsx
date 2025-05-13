import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axiosInstance";
import { toast, Toaster } from "react-hot-toast";
import {
  Shield,
  Save,
  X,
  ChevronDown,
  AlertCircle,
  // User,
  // Users,
  // LogOut,
  // ShieldCheck,
  // HousePlus,
  Check,
  Info,
} from "lucide-react";
import Sidebar from "./Sidebar"; // Assuming Sidebar is in the same directory

const AssignPermission = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced toast configurations
  const notifySuccess = (message) => toast.success(message, {
    duration: 4000,
    position: "top-center",
    style: {
      background: "#10B981",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      id: "data-loaded-toast", 

    },
    icon: <Check size={18} />,
  });

  const notifyError = (message) => toast.error(message, {
    duration: 5000,
    position: "top-center",
    style: {
      background: "#EF4444",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    icon: <AlertCircle size={18} />,
  });

  const notifyInfo = (message) => toast(message, {
    duration: 3000,
    position: "top-center",
    style: {
      background: "#3B82F6",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    icon: <Info size={18} />,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          api.get("Roles"),
          api.get("Permissions"),
        ]);
        setRoles(rolesRes.data || []);
        setPermissions(permissionsRes.data || []);
        toast.success("Data loaded successfully", {
          icon: "📋",
          duration: 3000,
          id: "data-loaded-toast", 
        });
      } catch (error) {
        notifyError("Failed to load roles and permissions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    notifySuccess("Logged out successfully");
    navigate("/login");
  };

  const selectRole = (roleID) => {
    setSelectedRoleId(roleID);
    setIsRoleDropdownOpen(false);
    setSelectedPermissions([]);
    
    const roleName = roles.find((role) => role.roleID === roleID)?.roleName;
    toast.success(`Role "${roleName}" selected`, {
      icon: "🛡️",
      duration: 2000,
      id: "data-loaded-toast", 

    });
  };

  const togglePermission = (permissionId) => {
    setSelectedPermissions((prev) => {
      const isAdding = !prev.includes(permissionId);
      const permission = permissions.find((p) => p.id === permissionId);
      
      if (isAdding) {
        toast.success(`Added "${permission?.name}" to removal list`, {
          icon: "➕",
          duration: 1500,
          position: "bottom-right",
          id: "data-loaded-toast", 
        });
        return [...prev, permissionId];
      } else {
        toast.success(`Removed "${permission?.name}" from removal list`, {
          icon: "➖",
          duration: 1500,
          position: "bottom-right",
          id: "data-loaded-toast", 
        });
        return prev.filter((id) => id !== permissionId);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoleId) {
      notifyError("Please select a role");
      return;
    }
    if (selectedPermissions.length === 0) {
      notifyError("Please select at least one permission");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        roleId: selectedRoleId,
        permissionIds: selectedPermissions,
      };
      await api.post("Permissions/assign", payload);
      notifySuccess("Permissions assigned successfully!");
      
      // Show loading toast before navigation
      toast.loading("Redirecting to permission management...", {
        duration: 1000,
      });
      
      // Delay navigation slightly for better UX
      setTimeout(() => {
        navigate("/permissionmanagement");
      }, 1200);
    } catch (error) {
      notifyError("Failed to assign permissions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoleName =
    roles.find((role) => role.roleID === selectedRoleId)?.roleName || "Select a role";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Toast container */}
      <Toaster toastOptions={{
        className: '',
        style: {
          maxWidth: '500px',
        },
      }} />
      
      {/* Sidebar */}
      <Sidebar activePage="/assign-permission" />

      {/* <div className="w-1/5 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-blue-400" /> 
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
            Dashboard
          </span>
        </h1>
        <ul className="space-y-3">
          <li
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition duration-300 hover:bg-gray-700 hover:scale-105"
            onClick={() => navigate("/userdashboard")}
          >
            <HousePlus className="w-5 h-5 text-blue-300" /> <span>Home</span>
          </li>
          <li
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition duration-300 hover:bg-gray-700 hover:scale-105"
            onClick={() => navigate("/userlist")}
          >
            <Users className="w-5 h-5 text-blue-300" /> <span>Users</span>
          </li>
          <li
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition duration-300 hover:bg-gray-700 hover:scale-105"
            onClick={() => navigate("/rolemanagement")}
          >
            <ShieldCheck className="w-5 h-5 text-blue-300" /> <span>Roles</span>
          </li>
          <li
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-700 shadow-md cursor-pointer transition duration-300 hover:bg-blue-600"
            onClick={() => navigate("/permissionmanagement")}
          >
            <Shield className="w-5 h-5 text-white" /> <span>Role Permissions</span>
          </li>
          <li
            className="flex items-center gap-3 p-3 mt-8 rounded-lg cursor-pointer transition duration-300 hover:bg-red-600 hover:scale-105 border border-red-700"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 text-red-300" /> <span>Logout</span>
          </li>
        </ul>
      </div> */}

      {/* Main Content */}
      <div className="w-4/5 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Shield className="text-blue-600" size={28} />
              Assign Permissions
            </h1>
            <p className="text-gray-500 mt-2 ml-10">
              Select a role and assign specific permissions to it
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Role Permissions Assignment
                </h2>
              </div>
            </div>

            {/* Form */}
            {isLoading ? (
              <div className="flex justify-center items-center p-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium">Loading data...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Role Dropdown */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-left flex justify-between items-center transition-all hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    >
                      <span
                        className={
                          selectedRoleId ? "text-gray-900 font-medium" : "text-gray-500"
                        }
                      >
                        {selectedRoleName}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          isRoleDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                        <ul className="py-1">
                          {roles.map((role) => (
                            <li key={role.roleID}>
                              <button
                                type="button"
                                className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                                  selectedRoleId === role.roleID
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-900"
                                }`}
                                onClick={() => selectRole(role.roleID)}
                              >
                                {role.roleName}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Grid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Permissions
                  </label>

                  {permissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedPermissions.includes(permission.id)
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => togglePermission(permission.id)}
                        >
                          <div className="flex items-start">
                            <div className="w-5 h-5 mt-1.5 rounded border flex items-center justify-center">
                              {selectedPermissions.includes(permission.id) ? (
                                <div className="w-4 h-4 bg-blue-600 rounded text-white flex items-center justify-center">
                                  <Check size={12} />
                                </div>
                              ) : (
                                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                              )}
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">
                                {permission.name}
                              </h3>
                              {permission.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <AlertCircle size={38} className="text-gray-400 mb-3" />
                      <p className="text-gray-500 font-medium">No permissions available</p>
                      <p className="text-gray-400 text-sm mt-1">Please contact an administrator</p>
                    </div>
                  )}
                  
                  {selectedPermissions.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">{selectedPermissions.length}</span> permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-10 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      toast("Returning to permissions management", { 
                        icon: '↩️', 
                        duration: 2000,
                        style: {
                          background: '#F3F4F6',
                          color: '#4B5563',
                        }
                      });
                      setTimeout(() => navigate("/permissionmanagement"), 500);
                    }}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 hover:shadow"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !selectedRoleId ||
                      selectedPermissions.length === 0
                    }
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 ${
                      isSubmitting ||
                      !selectedRoleId ||
                      selectedPermissions.length === 0
                        ? "bg-blue-300 text-white cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Permissions...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save Permissions</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPermission;
