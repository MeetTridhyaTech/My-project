import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import {
  Shield,
  Save,
  X,
  ChevronDown,
  AlertCircle,
  Check,
  Info,
  Menu,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { 
  fetchRoles, 
  fetchMenus, 
  fetchPermissions,
  assignRoleMenuPermission 
} from "../../features/assignPermissions/assignPermissionSlice";

const AssignPermission = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    roles, 
    menus, 
    permissions,
    loading: {
      roles: rolesLoading,
      menus: menusLoading,
      permissions: permissionsLoading,
      assigning: isAssigning
    },
    error 
  } = useSelector((state) => state.assignPermissions);

  // Local state
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  
  const menuId = "E30AD134-1A02-44DF-ADD2-EAB782C66BBB";
  const isLoading = rolesLoading || menusLoading;

  // Check user permissions
  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
    setUserPermissions(storedPermissions);
  }, []);

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

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch roles and menus simultaneously
        await Promise.all([
          dispatch(fetchRoles(menuId)).unwrap(),
          dispatch(fetchMenus(menuId)).unwrap()
        ]);
        
        notifySuccess("Data loaded successfully");
      } catch (error) {
        console.error("Failed to load initial data:", error);
        notifyError("Failed to load initial data");
      }
    };

    fetchInitialData();
  }, [dispatch, menuId]);

  // Fetch permissions when menu is selected
  useEffect(() => {
    if (selectedMenuId) {
      dispatch(fetchPermissions(menuId))
        .unwrap()
        .then(() => {
          toast.success("Permissions updated", {
            icon: "🔐",
            duration: 2000,
            id: "permissions-loaded-toast",
          });
        })
        .catch((error) => {
          console.error("Failed to load permissions:", error);
          notifyError("Failed to load permissions for this menu");
        });
    }
  }, [selectedMenuId, dispatch, menuId]);

  // Handle errors from Redux
  useEffect(() => {
    if (error) {
      notifyError(error);
    }
  }, [error]);

  const selectRole = (roleID) => {
    setSelectedRoleId(roleID);
    setIsRoleDropdownOpen(false);
    
    // Reset selected permissions when role changes
    setSelectedPermissions([]);
    
    const roleName = roles.find((role) => role.roleID === roleID)?.roleName;
    toast.success(`Role "${roleName}" selected`, {
      icon: "🛡️",
      duration: 2000,
      id: "role-selected-toast",
    });
  };

  const selectMenu = async (menuIdSelected) => {
  setSelectedMenuId(menuIdSelected);
  setIsMenuDropdownOpen(false);
  setSelectedPermissions([]);

  const selectedMenu = menus.find((menu) => {
    const id = menu.id || menu.menuId || menu.menuID;
    return id === menuIdSelected;
  });

  const menuName = selectedMenu?.name || selectedMenu?.menuName || selectedMenu?.title || "Unnamed Menu";

  toast.success(`Menu "${menuName}" selected`, {
    icon: "📁",
    duration: 2000,
    id: "menu-selected-toast",
  });
};


  const togglePermission = (permissionId) => {
    setSelectedPermissions((prev) => {
      const isAdding = !prev.includes(permissionId);
      const permission = permissions.find((p) => p.id === permissionId);
      
      if (isAdding) {
        toast.success(`Added "${permission?.name}" to assignment list`, {
          icon: "➕",
          duration: 1500,
          position: "bottom-right",
          id: "permission-toggle-toast", 
        });
        return [...prev, permissionId];
      } else {
        toast.success(`Removed "${permission?.name}" from assignment list`, {
          icon: "➖",
          duration: 1500,
          position: "bottom-right",
          id: "permission-toggle-toast", 
        });
        return prev.filter((id) => id !== permissionId);
      }
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedRoleId) {
      notifyError("Please select a role");
      return;
    }
    if (!selectedMenuId) {
      notifyError("Please select a menu");
      return;
    }
    if (selectedPermissions.length === 0) {
      notifyError("Please select at least one permission");
      return;
    }

    try {
      const payload = {
        roleId: selectedRoleId,
        menuId: selectedMenuId,
        permissionIds: selectedPermissions,
      };

      await dispatch(assignRoleMenuPermission(payload)).unwrap();
      
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
      console.error("Assignment failed:", error);
      notifyError("Failed to assign permissions. Please try again.");
    }
  };

  const selectedRoleName =
    roles.find((role) => role.roleID === selectedRoleId)?.roleName || "Select a role";

  // const selectedMenuName = 
  //   menus.find((menu) => menu.id === selectedMenuId)?.name || 
  //   menus.find((menu) => menu.menuId === selectedMenuId)?.menuName || 
  //   menus.find((menu) => menu.title === selectedMenuId)?.title || "Select a menu";

  const selectedMenu = menus.find((menu) => {
  const id = menu.id || menu.menuId || menu.menuID;
  return id === selectedMenuId;
});

const selectedMenuName = selectedMenu?.name || selectedMenu?.menuName || selectedMenu?.title || "Select a menu";


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

      {/* Main Content */}
      <div className="w-4/5 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Shield className="text-blue-600" size={28} />
              Assign Permissions
            </h1>
            <p className="text-gray-500 mt-2 ml-10">
              Select a role and menu to assign specific permissions
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Role & Menu Permissions Assignment
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
              <div className="p-8">
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

                {/* Menu Dropdown */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Selection
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-left flex justify-between items-center transition-all hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
                    >
                      <span className="flex items-center gap-2">
                        <Menu size={16} className="text-gray-400" />
                        <span
                          className={
                            selectedMenuId ? "text-gray-900 font-medium" : "text-gray-500"
                          }
                        >
                          {selectedMenuName}
                        </span>
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          isMenuDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isMenuDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                        <ul className="py-1">
                          {menus.length > 0 ? (
                            menus.map((menu) => {
                              const menuId = menu.id || menu.menuId || menu.menuID;
                              const menuName = menu.name || menu.menuName || menu.title || "Unnamed Menu";
                              
                              return (
                                <li key={menuId}>
                                  <button
                                    type="button"
                                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                                      selectedMenuId === menuId
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-900"
                                    }`}
                                    onClick={() => selectMenu(menuId)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Menu size={14} className="text-gray-400" />
                                      {menuName}
                                    </div>
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-4 py-3 text-gray-500 text-sm">
                              No menus available
                            </li>
                          )}
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

                  {permissionsLoading ? (
                    <div className="flex justify-center items-center p-10 border border-dashed border-gray-300 rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm">Loading permissions...</p>
                      </div>
                    </div>
                  ) : permissions.length > 0 ? (
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
                      <p className="text-gray-400 text-sm mt-1">Please select a menu to view permissions</p>
                    </div>
                  )}
                  
                  {selectedPermissions.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">{selectedPermissions.length}</span> permission{selectedPermissions.length !== 1 ? 's' : ''} selected for assignment
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
                    onClick={handleSubmit}
                    disabled={
                      isAssigning ||
                      !selectedRoleId ||
                      !selectedMenuId ||
                      selectedPermissions.length === 0
                    }
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 ${
                      isAssigning ||
                      !selectedRoleId ||
                      !selectedMenuId ||
                      selectedPermissions.length === 0
                        ? "bg-blue-300 text-white cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow"
                    }`}
                  >
                    {isAssigning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Assigning Permissions...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Assign Permissions</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPermission;