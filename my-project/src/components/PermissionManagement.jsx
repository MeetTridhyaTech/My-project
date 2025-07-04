import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "./GlobalLoader";
import {
  Trash2,
  Shield,
  UserCheck,
  AlertCircle,
  ChevronLeft,
  Menu,
  Users,
  Lock,
  Eye,
  X,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchRolePermissions } from "../../features/RoleMenuPermissions/RoleMenuPermissionSlice";

const PermissionManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: permissions, loading, error } = useSelector((state) => state.rolePermissions);
  const [userPermissions, setUserPermissions] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const canAdd = userPermissions.includes("Add");
  const canDelete = userPermissions.includes("Delete");

  useEffect(() => {
    dispatch(fetchRolePermissions(menuId));
  }, [dispatch]);

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
    setUserPermissions(storedPermissions);
  }, []);

  const menuId = "E30AD134-1A02-44DF-ADD2-EAB782C66BBB";

  const openPermissionModal = (menu, roleName) => {
    setSelectedMenu({ ...menu, roleName });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMenu(null);
  };

  const handleAssignPermission = () => {
    navigate("/assign-permission");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePage="/permissionmanagement" />

      {/* Main Content */}
      <div className="w-4/5 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Permission Management</h1>
                    <p className="text-gray-600 mt-1">Manage roles and their assigned permissions</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {canAdd && (
                    <button
                      onClick={handleAssignPermission}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <UserCheck size={18} />
                      <span>Assign Permission</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => navigate("/remove-permission")}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                      <span>Delete Permission</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/userlist")}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg border transition-colors"
                  >
                    <ChevronLeft size={18} />
                    <span>Back to Users</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Menu className="text-blue-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">Role Permissions Overview</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>{permissions.length} Roles</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <GlobalLoader message="Loading role menu permissions..." />

              ) : (
                <>
                  {permissions.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <AlertCircle size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Permissions Found</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        No roles with permissions have been configured yet. Click "Assign Permission" to get started.
                      </p>
                      {canAdd && (
                        <button
                          onClick={handleAssignPermission}
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          <UserCheck size={18} />
                          <span>Assign First Permission</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {permissions.map((role, roleIndex) => (
                        <div key={`${role.roleName}-${roleIndex}`} className="border border-gray-200 rounded-lg">
                          {/* Role Header */}
                          <div className="px-6 py-4 bg-gray-50 border-b">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Shield className="text-blue-600" size={20} />
                                <div>
                                  <h3 className="font-semibold text-gray-800">{role.roleName}</h3>
                                  <p className="text-sm text-gray-600">
                                    {role.menus.length} menu{role.menus.length !== 1 ? 's' : ''} configured
                                  </p>
                                </div>
                              </div>
                              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                {role.menus.length} Menus
                              </div>
                            </div>
                          </div>

                          {/* Menus List */}
                          <div className="p-6">
                            <div className="space-y-3">
                              {role.menus.map((menu, menuIdx) => (
                                <div key={`${role.roleName}-${menu.title}-${menuIdx}`} className="bg-gray-50 rounded-lg p-4 border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Menu className="text-gray-600" size={18} />
                                      <div>
                                        <h4 className="font-medium text-gray-800">{menu.title}</h4>
                                        <p className="text-sm text-gray-500">
                                          {menu.permissions?.length || 0} permission{menu.permissions?.length !== 1 ? 's' : ''} assigned
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => openPermissionModal(menu, role.roleName)}
                                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                                    >
                                      <Eye size={16} />
                                      <span>View Permissions</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      {showModal && selectedMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-blue-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Menu className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedMenu.title}</h3>
                  <p className="text-sm text-gray-600">Role: {selectedMenu.roleName}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedMenu.permissions && selectedMenu.permissions.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Assigned Permissions ({selectedMenu.permissions.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedMenu.permissions.map((perm, permIdx) => (
                      <div key={permIdx} className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Lock size={14} className="text-blue-600" />
                          <span className="text-blue-800 font-medium text-sm">{perm}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="text-gray-400 mx-auto mb-3" size={48} />
                  <p className="text-gray-500 font-medium">No permissions assigned</p>
                  <p className="text-gray-400 text-sm mt-1">This menu has no permissions configured</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;