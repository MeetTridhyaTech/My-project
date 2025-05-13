import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Menu as MenuIcon, Save, Trash2, Edit } from "lucide-react";
import Sidebar from "./Sidebar";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState(null);
  
  // Form states
  const [menuForm, setMenuForm] = useState({
    // id: undefined,
    title: "",
    icon: "",
    path: "",
    order: 0,
    parentMenuId: null,
    roleName: "" // Added

  });
  
  const [formErrors, setFormErrors] = useState({});

  // Available icon options
  const iconOptions = [
    "User",
    "Users",
    "Shield",
    "ShieldCheck",
    "HousePlus",
    "LayoutDashboard",
    "Menu",
    "Settings",
    "FileText",
    "ShoppingCart"
  ];

  // Fetch menus
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get("Menus/all");
      if (Array.isArray(response.data)) {
        const sortedMenus = response.data.sort((a, b) => a.order - b.order);
        setMenus(sortedMenus);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  // Set form values when editing a menu
  useEffect(() => {
    if (editingMenu) {
      setMenuForm({
        id: editingMenu.id || null,
        parentMenuId: editingMenu.parentMenuId || null,
        title: editingMenu.title || "",
        icon: editingMenu.icon || "",
        path: editingMenu.path || "",
        order: editingMenu.order || 0,
        roleName: editingMenu.roleName || ""

      });
    }
  }, [editingMenu]);

  const handleMenuFormChange = (e) => {
    const { name, value } = e.target;
    setMenuForm(prev => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value
    }));
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (!data.path.trim()) errors.path = "Path is required";
    
    return errors;
  };

  const handleSubmitMenu = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(menuForm);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const menuData = {
        ...menuForm,
        id: editingMenu ? editingMenu.id : null
      };

      if (editingMenu) {
        // Update existing menu
        await api.put(`Menus/update/${menuData.id}`, menuData);
        toast.success("Menu updated successfully");
      } else {
        // Create new menu
        await api.post("Menus/create", menuData);
        toast.success("Menu created successfully");
      }

      // Reset form and fetch updated menus
      resetMenuForm();
      setEditingMenu(null);
      fetchMenus();
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Failed to save menu");
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      title: "",
      icon: "",
      path: "",
      order: 0
    });
    setFormErrors({});
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      try {
        await api.delete(`Menus/delete/${id}`);
        toast.success("Menu deleted successfully");
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu:", error);
        toast.error("Failed to delete menu");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Menu */}
      <Sidebar activePage="/menu-management" />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-blue-600" />
            Menu Management
          </h1>

          {/* Menu Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingMenu ? "Edit Menu" : "Create New Menu"}
            </h2>
            <form onSubmit={handleSubmitMenu} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    name="title"
                    value={menuForm.title}
                    onChange={handleMenuFormChange}
                    className="w-full p-2 border rounded-md"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    name="icon"
                    value={menuForm.icon}
                    onChange={handleMenuFormChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select an icon</option>
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Path
                  </label>
                  <input
                    name="path"
                    value={menuForm.path}
                    onChange={handleMenuFormChange}
                    className="w-full p-2 border rounded-md"
                  />
                  {formErrors.path && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.path}</p>
                  )}       
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  name="roleName"
                  value={menuForm.roleName || ""}
                  onChange={handleMenuFormChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. Admin, Manager"
                />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={menuForm.order}
                    onChange={handleMenuFormChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  {editingMenu ? "Update Menu" : "Save Menu"}
                </button>
                {editingMenu && (
                  <button
                    type="button"
                    onClick={() => {
                      resetMenuForm();
                      setEditingMenu(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Menu List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Menu List</h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : menus.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No menus found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Icon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {menus.map((menu) => (
                      <tr key={menu.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{menu.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{menu.icon || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{menu.path}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{menu.order}</td>
                        <td className="px-4 py-2">{menu.roleName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(menu)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;






// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-hot-toast";
// import { Menu as MenuIcon, Save, Trash2, Edit } from "lucide-react";
// import Sidebar from "./Sidebar";

// // Create API instance outside component to avoid recreation on each render
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
// });

// const MenuManagement = () => {
//   const location = useLocation();  
//   const [menus, setMenus] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingMenu, setEditingMenu] = useState(null);
  
//   // Available icon options
//   const iconOptions = [
//     "User",
//     "Users",
//     "Shield",
//     "ShieldCheck",
//     "HousePlus",
//     "LayoutDashboard",
//     "Menu",
//     "Settings",
//     "FileText"
//   ];
  
//   // Form states
//   const initialMenuFormState = {
//     title: "",
//     icon: "",
//     path: "",
//     order: 0
//   };
//   const token = localStorage.getItem("token");   

//   const [menuForm, setMenuForm] = useState(initialMenuFormState);
//   const [formErrors, setFormErrors] = useState({});

//   // Fetch menus
//   useEffect(() => {
//     fetchMenus();
//   }, []);

//   const fetchMenus = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("Menus/all", {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       if (Array.isArray(response.data)) {
//         const sortedMenus = response.data.sort((a, b) => a.order - b.order);
//         setMenus(sortedMenus);
//       }
//     } catch (error) {
//       console.error("Error fetching menus:", error);
//       toast.error("Failed to load menus");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Set form values when editing a menu
//   useEffect(() => {
//     if (editingMenu) {
//       setMenuForm({
//         title: editingMenu.title || "",
//         icon: editingMenu.icon || "",
//         path: editingMenu.path || "",
//         order: editingMenu.order || 0
//       });
//     } else {
//       setMenuForm(initialMenuFormState);
//     }
//   }, [editingMenu]);

//   const handleMenuFormChange = (e) => {
//     const { name, value } = e.target;
//     setMenuForm(prev => ({
//       ...prev,
//       [name]: name === "order" ? parseInt(value) || 0 : value
//     }));
    
//     // Clear error for the field being edited
//     if (formErrors[name]) {
//       setFormErrors(prev => ({
//         ...prev,
//         [name]: undefined
//       }));
//     }
//   };

//   const validateForm = (data) => {
//     const errors = {};
//     if (!data.title.trim()) errors.title = "Title is required";
//     if (!data.path.trim()) errors.path = "Path is required";
    
//     return errors;
//   };

//   const handleSubmitMenu = async (e) => {
//     e.preventDefault();
    
//     const validationErrors = validateForm(menuForm);
//     if (Object.keys(validationErrors).length > 0) {
//       setFormErrors(validationErrors);
//       return;
//     }

//     try {
//       const menuData = {
//         ...menuForm,
//         id: editingMenu ? editingMenu.id : undefined,
//         parentMenuId: null
//       };

//       if (editingMenu) {
//         // Update existing menu
//         await api.put(`Menus/update/${editingMenu.id}`, menuData);
//         toast.success("Menu updated successfully");
//       } else {
//         // Create new menu
//         await api.post("Menus/create", menuData);
//         toast.success("Menu created successfully");
//       }

//       // Reset form and fetch updated menus
//       resetMenuForm();
//       setEditingMenu(null);
//       fetchMenus();
//     } catch (error) {
//       console.error("Error saving menu:", error);
//       toast.error(`Failed to save menu: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   const resetMenuForm = () => {
//     setMenuForm(initialMenuFormState);
//     setFormErrors({});
//   };

//   const handleEdit = (menu) => {
//     setEditingMenu(menu);
//   };

//   const handleDelete = async (menuId) => {
//     if (window.confirm("Are you sure you want to delete this menu?")) {
//       try {
//         await api.delete(`menus/delete/${menuId}`);
//         toast.success("Menu deleted successfully");
//         fetchMenus();
//       } catch (error) {
//         console.error("Error deleting menu:", error);
//         toast.error(`Failed to delete menu: ${error.response?.data?.message || error.message}`);
//       }
//     }
//   };

//   // Form components to reduce duplicated code
//   const FormField = ({ label, name, value, onChange, type = "text", error, options = null }) => (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         {label}
//       </label>
//       {options ? (
//         <select
//           name={name}
//           value={value}
//           onChange={onChange}
//           className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//         >
//           <option value="">Select an icon</option>
//           {options.map((option) => (
//             <option key={option} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//       ) : (
//         <input
//           type={type}
//           name={name}
//           value={value}
//           onChange={onChange}
//           className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
//         />
//       )}
//       {error && (
//         <p className="text-red-500 text-sm mt-1">{error}</p>
//       )}
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar Component */}
//       <Sidebar activePage={location.pathname} />
      
//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
//           <MenuIcon className="w-6 h-6 text-blue-600" />
//           Menu Management
//         </h1>

//         {/* Menu Form */}
//         <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//           <h2 className="text-xl font-semibold mb-4">
//             {editingMenu ? "Edit Menu" : "Create New Menu"}
//           </h2>
//           <form onSubmit={handleSubmitMenu} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField 
//                 label="Title"
//                 name="title"
//                 value={menuForm.title}
//                 onChange={handleMenuFormChange}
//                 error={formErrors.title}
//               />

//               <FormField 
//                 label="Icon"
//                 name="icon"
//                 value={menuForm.icon}
//                 onChange={handleMenuFormChange}
//                 options={iconOptions}
//               />

//               <FormField 
//                 label="Path"
//                 name="path"
//                 value={menuForm.path}
//                 onChange={handleMenuFormChange}
//                 error={formErrors.path}
//               />

//               <FormField 
//                 label="Order"
//                 name="order"
//                 type="number"
//                 value={menuForm.order}
//                 onChange={handleMenuFormChange}
//               />
//             </div>

//             <div className="flex gap-2">
//               <button
//                 type="submit"
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-blue-700 transition-colors"
//               >
//                 <Save className="w-4 h-4" />
//                 {editingMenu ? "Update Menu" : "Save Menu"}
//               </button>
//               {editingMenu && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     resetMenuForm();
//                     setEditingMenu(null);
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>

//         {/* Menu List */}
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Menu List</h2>
//           {loading ? (
//             <div className="flex justify-center items-center h-40">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
//             </div>
//           ) : menus.length === 0 ? (
//             <p className="text-gray-500 text-center py-4">No menus found</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full table-auto">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Title
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Icon
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Path
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Order
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {menus.map((menu) => (
//                     <tr key={menu.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">{menu.title}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">{menu.icon || "-"}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">{menu.path}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">{menu.order}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex space-x-2">
//                           <button
//                             onClick={() => handleEdit(menu)}
//                             className="text-blue-600 hover:text-blue-800 transition-colors"
//                             title="Edit Menu"
//                           >
//                             <Edit className="w-5 h-5" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(menu.id)}
//                             className="text-red-600 hover:text-red-800 transition-colors"
//                             title="Delete Menu"
//                           >
//                             <Trash2 className="w-5 h-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MenuManagement;