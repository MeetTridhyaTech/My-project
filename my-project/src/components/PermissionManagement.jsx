// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "./axiosInstance";
// import { toast } from "react-hot-toast";
// import {
//   Trash2,
//   Shield,
//   UserCheck,
//   AlertCircle,
//   ChevronLeft,
// } from "lucide-react";
// import Sidebar from "./Sidebar";

// const PermissionManagement = () => {
//   const navigate = useNavigate();
//   const [permissions, setPermissions] = useState([]); // Ensure permissions are initialized as an empty array
//   const [loading, setLoading] = useState(true);
//   const [userPermissions, setUserPermissions] = useState([]);
//     const [expandedMenus, setExpandedMenus] = useState({}); 
  
//   const canAdd = userPermissions.includes("AddUser");
//   const canDelete = userPermissions.includes("DeleteUser");

//       useEffect(() => {
//   const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
//   setUserPermissions(storedPermissions);
// }, []);

//   const menuId = "E30AD134-1A02-44DF-ADD2-EAB782C66BBB";

//     const toggleMenuPermissions = (roleName, menuTitle) => {
//     const key = `${roleName}-${menuTitle}`;
//     setExpandedMenus((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const fetchPermissions = async () => {
//     try {
//       const permissionsRes = await api.get(`Permissions/roles-with-permissions/${menuId}`);
//       setPermissions(permissionsRes.data || []); // Ensure empty array if no data
//     } catch (error) {
//       console.error("Error fetching permissions:", error);
//       toast.error("Failed to fetch permissions ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPermissions();
//   }, []);

//   const handleAssignPermission = () => {
//     navigate("/assign-permission");
//   };

//   return (
//     <div className="flex">
//       {/* Sidebar */}
//       <Sidebar activePage="/permissionmanagement" />

//       {/* Main Content */}
//       <div className="w-4/5 bg-gray-50 min-h-screen p-6">
//         <div className="max-w-6xl mx-auto">
//           {/* Header */}
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">Permission Management</h1>
//               <p className="text-gray-500 mt-2">Manage roles and their assigned permissions</p>
//             </div>
//             <div className="flex gap-3">
//               {canAdd &&(
//               <button
//                 onClick={handleAssignPermission}
//                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
//               >
//                 <UserCheck size={18} />
//                 <span>Assign Permission</span>
//               </button>
//               )}
//               {canDelete &&(
//               <button
//                 onClick={() => navigate("/remove-permission")}
//                 className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
//               >
//                 <Trash2 size={18} />
//                 <span>Delete Permission</span>
//               </button>
//               )}
//               <button
//                 onClick={() => navigate("/userlist")}
//                 className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
//               >
//                 <ChevronLeft size={18} />
//                 <span>Back to Users</span>
//               </button>
//             </div>
//           </div>

//           {/* Main Content Card */}
//           <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
//             <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
//               <div className="flex items-center gap-3">
//                 <Shield className="text-blue-600" size={24} />
//                 <h2 className="text-xl font-semibold text-gray-800">Role Permissions</h2>
//               </div>
//             </div>

//             <div className="p-6">
//               {loading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <div className="flex flex-col items-center gap-3">
//                     <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
//                     <p className="text-gray-500 font-medium">Loading permissions...</p>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   {permissions.length === 0 ? (
//                     <div className="py-16 flex flex-col items-center justify-center text-center">
//                       <AlertCircle size={48} className="text-gray-400 mb-4" />
//                       <h3 className="text-lg font-medium text-gray-700 mb-2">No Permissions Found</h3>
//                       <p className="text-gray-500 max-w-md">
//                         No roles with permissions have been configured yet. Click "Assign Permission" to get started.
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="overflow-x-auto">
//                       <table className="w-full border-collapse">
//                         <thead>
//                           <tr className="bg-gray-50">
//                             <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Role Name</th>
//                             <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Permissions</th>
//                           </tr>
//                         </thead>
//                         {/* <tbody className="divide-y divide-gray-100">
//                           {permissions.map((permission, index) => (
//                             <tr key={`${permission.roleName}-${index}`} className="hover:bg-blue-50 transition-colors duration-150">
//                               <td className="px-6 py-4">
//                                 <div className="font-medium text-gray-800">{permission.roleName}</div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 {permission.permissions && permission.permissions.length > 0 ? (
//                                   <div className="flex flex-wrap gap-2">
//                                     {permission.permissions.map((perm, i) => (
//                                       <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                                         {perm}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 ) : (
//                                   <span className="text-gray-400 italic">No permissions assigned</span>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody> */}


//   <tbody className="divide-y divide-gray-100">
//     {permissions.map((role) =>
//       role.menus.map((menu, menuIdx) => {
//         const key = `${role.roleName}-${menu.title}`;
//         const isExpanded = expandedMenus[key];
//         return (
//           <tr key={key} className="hover:bg-blue-50 transition-colors duration-150">
//             {/* Role name only in first menu row */}
//             {menuIdx === 0 ? (
//               <td
//                 rowSpan={role.menus.length}
//                 className="px-6 py-4 align-top font-semibold text-gray-800 whitespace-nowrap"
//               >
//                 {role.roleName}
//               </td>
//             ) : null}

//             <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">{menu.title}</td>
//             <td className="px-6 py-4">
//               <button
//                 onClick={() => toggleMenuPermissions(role.roleName, menu.title)}
//                 className="text-blue-600 hover:underline text-sm font-medium"
//               >
//                 {isExpanded ? "Hide Permissions" : "View Permissions"}
//               </button>
//               {isExpanded && (
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {menu.permissions && menu.permissions.length > 0 ? (
//                     menu.permissions.map((perm, permIdx) => (
//                       <span
//                         key={permIdx}
//                         className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
//                       >
//                         {perm}
//                       </span>
//                     ))
//                   ) : (
//                     <span className="text-gray-400 italic">No permissions assigned</span>
//                   )}
//                 </div>
//               )}
//             </td>
//           </tr>
//         );
//       })
//     )}
//   </tbody>;



//                       </table>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PermissionManagement;





import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import api from "./axiosInstance";
// import { toast } from "react-hot-toast";
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
import { fetchRolePermissions  } from "../../features/RoleMenuPermissions/RoleMenuPermissionSlice";

const PermissionManagement = () => {
  const navigate = useNavigate();
  // const [permissions, setPermissions] = useState([]);
  // const [loading, setLoading] = useState(true);
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

  // const fetchPermissions = async () => {
  //   try {
  //     const permissionsRes = await api.get(`Permissions/roles-with-permissions/${menuId}`);
  //     setPermissions(permissionsRes.data || []);
  //   } catch (error) {
  //     console.error("Error fetching permissions:", error);
  //     toast.error("Failed to fetch permissions ❌");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchPermissions();
  // }, []);

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
                // <div className="flex justify-center items-center py-16">
                //   <div className="flex flex-col items-center gap-4">
                //     <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                //     <p className="text-gray-600">Loading permissions...</p>
                //   </div>
                // </div>
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