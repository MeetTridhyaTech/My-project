import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axiosInstance";
import { toast, Toaster } from "react-hot-toast";
import {
  Shield,
//   Save,
  X,
  ChevronDown,
  AlertCircle,
//   User,
//   Users,
//   LogOut,
//   ShieldCheck,
//   HousePlus,
  Trash2,
  Info,
} from "lucide-react";
import Sidebar from "./Sidebar"; // Assuming Sidebar is in the same directory

const RemovePermission = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const menuId = "E30AD134-1A02-44DF-ADD2-EAB782C66BBB";


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          api.get(`Roles/${menuId}`),
          api.get(`Permissions/All/${menuId}`),
        ]);
        setRoles(rolesRes.data || []);
        setPermissions(permissionsRes.data || []);
        toast.success("Data loaded successfully", {
          icon: "📋",
          duration: 3000,
          id: "data-loaded-toast", 
        });
      } catch (error) {
        toast.error("Failed to load roles and permissions", {
          icon: "❌",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    toast.success("Logged out successfully", {
      icon: "👋",
      duration: 3000,
      style: {
        background: "#f8f9fa",
        border: "1px solid #dee2e6",
        padding: "16px",
        color: "#212529",
      },
    });
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
      toast.error("Please select a role", {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission", {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        roleId: selectedRoleId,
        permissionIds: selectedPermissions,
      };
      await api.post(`Permissions/remove-bulk/${menuId}`, payload);
      
      toast.success("Permissions deleted successfully!", {
        icon: "✅",
        duration: 4000,
        style: {
          background: "#d1e7dd",
          border: "1px solid #badbcc",
          padding: "16px",
          color: "#0f5132",
          id: "data-loaded-toast", 
        },
      });
      
      // Show countdown toast before redirecting
      let count = 3;
      const countdownInterval = setInterval(() => {
        toast.success(`Redirecting in ${count}...`, {
          id: "redirect-countdown",
          duration: 1000,
          // id: "data-Redirect-toast", 
        });
        count--;
        if (count === 0) {
          clearInterval(countdownInterval);
          navigate("/permissionmanagement");
        }
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to delete permissions from role", {
        icon: "❌",
        duration: 5000,
        style: {
          background: "#f8d7da",
          border: "1px solid #f5c2c7",
          padding: "16px",
          color: "#842029",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoleName =
    roles.find((role) => role.roleID === selectedRoleId)?.roleName || "Select a role";
    
  const handleCancel = () => {
    toast.success("Operation cancelled", {
      icon: "🔙",
      duration: 2000,
      id: "data-loaded-toast", 

    });
    navigate("/permissionmanagement");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: "shadow-md rounded-lg",
        }}
      />

      {/* Sidebar */}
        <Sidebar activePage="/remove-permission" />

      {/* Main Content */}
      <div className="w-4/5 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Delete Permissions</h1>
              <p className="text-gray-500 mt-1">
                Remove permissions from selected role
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-200 rounded-full">
                  <Shield className="text-red-600" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Remove Role Permissions
                </h2>
              </div>
            </div>

            {/* Alert info box */}
            <div className="mx-6 mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md flex items-start gap-3">
              <Info size={20} className="text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700">Important Note</h4>
                <p className="text-sm text-blue-600">
                  Removing permissions will immediately affect all users with this role.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Form */}
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium mt-3">Loading data...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                {/* Role Dropdown */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-left flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    >
                      <span
                        className={`${
                          selectedRoleId ? "text-gray-900 font-medium" : "text-gray-500"
                        }`}
                      >
                        {selectedRoleName}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform duration-300 ${
                          isRoleDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <ul className="py-1">
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <li key={role.roleID}>
                                <button
                                  type="button"
                                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 ${
                                    selectedRoleId === role.roleID
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-900"
                                  }`}
                                  onClick={() => selectRole(role.roleID)}
                                >
                                  {role.roleName}
                                </button>
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-3 text-gray-500 text-center">
                              No roles available
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Grid */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Permissions to Remove
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {selectedPermissions.length} selected
                    </span>
                  </div>

                  {permissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                            selectedPermissions.includes(permission.id)
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => togglePermission(permission.id)}
                        >
                          <div className="flex items-start">
                            <div className="w-5 h-5 mt-1.5 rounded border flex items-center justify-center">
                              {selectedPermissions.includes(permission.id) ? (
                                <div className="w-4 h-4 bg-red-600 rounded text-white flex items-center justify-center">
                                  ✓
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
                    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <AlertCircle size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-500">No permissions available</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200"
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
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 ${
                      isSubmitting ||
                      !selectedRoleId ||
                      selectedPermissions.length === 0
                        ? "bg-red-300 text-white cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        <span>Delete Permissions</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Permission Count Summary */}
          {selectedRoleId && selectedPermissions.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
              <p className="text-sm text-gray-600">
                Removing <span className="font-medium text-red-600">{selectedPermissions.length}</span> permission(s) 
                from role "<span className="font-medium">{selectedRoleName}</span>"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemovePermission;