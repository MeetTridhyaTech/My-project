import { useState, useEffect } from "react";
import api from "./axiosInstance";
import { toast } from "react-hot-toast";
import { Menu as MenuIcon, Save, Trash2, Edit, Search, ChevronDown, X } from "lucide-react";
import Sidebar from "./Sidebar";

// Multi-Select Dropdown Component
const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder = "Select roles..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const newSelected = selectedValues.includes(option)
      ? selectedValues.filter(item => item !== option)
      : [...selectedValues, option];
    onChange(newSelected);
  };

  const removeOption = (option) => {
    onChange(selectedValues.filter(item => item !== option));
  };

  return (
    <div className="relative">
      {/* Selected items display */}
      <div 
        className="w-full p-2 border rounded-md min-h-[42px] cursor-pointer bg-white flex flex-wrap gap-1 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          selectedValues.map((value) => (
            <span
              key={value}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              {value}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(value);
                }}
                className="hover:bg-blue-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm border rounded focus:outline-none focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Options list */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-gray-500 text-sm">No roles found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                    selectedValues.includes(option) ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{option}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  
  const canAdd = userPermissions.includes("Add");
  const canEdit = userPermissions.includes("Edit");
  const canDelete = userPermissions.includes("Delete");

  // State for available roles loaded from API
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
    setUserPermissions(storedPermissions);
  }, []);
  
  // Form states - Modified to handle array of roles
  const [menuForm, setMenuForm] = useState({
    title: "",
    icon: "",
    path: "",
    order: 0,
    parentMenuId: null,
    roleNames: []
  });

  const menuId = "73B717D1-A5F0-4326-AAE3-6370A2373472";
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

  // Fetch menus and roles
  useEffect(() => {
    fetchMenus();
    fetchRoles();
  }, []);

  // Filter menus when search query or menus change
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMenus(menus);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = menus.filter(menu => 
        menu.title.toLowerCase().includes(query) || 
        menu.path.toLowerCase().includes(query) || 
        (menu.roleName && menu.roleName.toLowerCase().includes(query))
      );
      setFilteredMenus(filtered);
    }
  }, [searchQuery, menus]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`Roles/${menuId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Assuming the API returns an array of role objects with a 'name' property
      // Adjust this based on your actual API response structure
      if (Array.isArray(response.data)) {
        const roleNames = response.data.map(role => role.name || role.roleName || role.title || role);
        setAvailableRoles(roleNames);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
      // Fallback to some default roles if API fails
      setAvailableRoles([]);
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken"); 
      const response = await api.get(`Menus/all/${menuId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data)) {
        const sortedMenus = response.data.sort((a, b) => a.order - b.order);
        setMenus(sortedMenus);
        setFilteredMenus(sortedMenus);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  // Set form values when editing a menu - Modified to handle role arrays
  useEffect(() => {
    if (editingMenu) {
      setMenuForm({
        id: editingMenu.id || null,
        parentMenuId: editingMenu.parentMenuId || null,
        title: editingMenu.title || "",
        icon: editingMenu.icon || "",
        path: editingMenu.path || "",
        order: editingMenu.order || 0,
        roleNames: editingMenu.roleName ? editingMenu.roleName.split(',').map(r => r.trim()) : []
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

  // Handle role selection change
  const handleRoleChange = (selectedRoles) => {
    setMenuForm(prev => ({
      ...prev,
      roleNames: selectedRoles
    }));
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (!data.path.trim()) errors.path = "Path is required";
    if (!data.roleNames || data.roleNames.length === 0) errors.roleNames = "At least one role must be selected";
    if (data.order <= 0) errors.order = "Order must be greater than 0"; 
    
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
      // Convert roleNames array back to comma-separated string for backend
      const menuData = {
        ...menuForm,
        roleName: menuForm.roleNames.join(', '), // Convert array to string
        id: editingMenu ? editingMenu.id : null
      };

      if (editingMenu) {
        await api.put(`Menus/update/${menuData.id}/${menuId}`, menuData);
        toast.success("Menu updated successfully");
      } else {
        await api.post(`Menus/create/${menuId}`, menuData);
        toast.success("Menu created successfully");
      }

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
      order: 0,
      roleNames: []
    });
    setFormErrors({});
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      try {
        await api.delete(`Menus/${id}/${menuId}`);
        toast.success("Menu deleted successfully");
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu:", error);
        toast.error("Failed to delete menu");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
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

                {/* Updated Role Selection with Multi-Select Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Names
                  </label>
                  <MultiSelectDropdown
                    options={availableRoles}
                    selectedValues={menuForm.roleNames}
                    onChange={handleRoleChange}
                    placeholder="Select roles..."
                  />
                  {formErrors.roleNames && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.roleNames}</p>
                  )}
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
                    min={1}
                  />
                  {formErrors.order && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.order}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {canAdd && (
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    {editingMenu ? "Update Menu" : "Save Menu"}
                  </button>
                )}
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

          {/* Menu List with Search */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Menu List</h2>
              <div className="relative">
                <div className="flex items-center border rounded-md pr-2">
                  <input
                    type="text"
                    placeholder="Search menus..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="p-2 w-64 rounded-md focus:outline-none"
                  />
                  {searchQuery ? (
                    <button 
                      onClick={clearSearch}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  ) : (
                    <Search className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredMenus.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {searchQuery ? "No menus match your search" : "No menus found"}
              </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMenus.map((menu) => (
                      <tr key={menu.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{menu.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{menu.icon || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{menu.path}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{menu.order}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {menu.roleName ? menu.roleName.split(',').map((role, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs"
                              >
                                {role.trim()}
                              </span>
                            )) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {canEdit && (
                              <button
                                onClick={() => handleEdit(menu)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(menu.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
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
// import api from "./axiosInstance";
// import { toast } from "react-hot-toast";
// import { Menu as MenuIcon, Save, Trash2, Edit, Search } from "lucide-react";
// import Sidebar from "./Sidebar";

// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_BASE_URL,
// // });

// const MenuManagement = () => {
//   const [menus, setMenus] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingMenu, setEditingMenu] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredMenus, setFilteredMenus] = useState([]);
//   const [userPermissions, setUserPermissions] = useState([]);
  
//   const canAdd = userPermissions.includes("Add");
//   const canEdit = userPermissions.includes("Edit");
//   const canDelete = userPermissions.includes("Delete");

//     useEffect(() => {
//   const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
//   setUserPermissions(storedPermissions);
// }, []);
  
//   // Form states
//   const [menuForm, setMenuForm] = useState({
//     // id: undefined,
//     title: "",
//     icon: "",
//     path: "",
//     order: 0,
//     parentMenuId: null,
//     roleName: "" // Added

//   });

//   const menuId = "73B717D1-A5F0-4326-AAE3-6370A2373472";

  
//   const [formErrors, setFormErrors] = useState({});

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
//     "FileText",
//     "ShoppingCart"
//   ];

//   // Fetch menus
//   useEffect(() => {
//     fetchMenus();
//   }, []);

//   // Filter menus when search query or menus change
//   useEffect(() => {
//     if (searchQuery.trim() === "") {
//       setFilteredMenus(menus);
//     } else {
//       const query = searchQuery.toLowerCase();
//       const filtered = menus.filter(menu => 
//         menu.title.toLowerCase().includes(query) || 
//         menu.path.toLowerCase().includes(query) || 
//         (menu.roleName && menu.roleName.toLowerCase().includes(query))
//       );
//       setFilteredMenus(filtered);
//     }
//   }, [searchQuery, menus]);

//   const fetchMenus = async () => {
//     try {
//       setLoading(true);
//           const token = localStorage.getItem("authToken"); 
//             // const menuId = "73B717D1-A5F0-4326-AAE3-6370A2373472";
//         const response = await api.get(`Menus/all/${menuId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//               if (Array.isArray(response.data)) {
//         const sortedMenus = response.data.sort((a, b) => a.order - b.order);
//         setMenus(sortedMenus);
//         setFilteredMenus(sortedMenus); // Initialize filtered menus with all menus
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
//         id: editingMenu.id || null,
//         parentMenuId: editingMenu.parentMenuId || null,
//         title: editingMenu.title || "",
//         icon: editingMenu.icon || "",
//         path: editingMenu.path || "",
//         order: editingMenu.order || 0,
//         roleName: editingMenu.roleName || ""

//       });
//     }
//   }, [editingMenu]);

//   const handleMenuFormChange = (e) => {
//     const { name, value } = e.target;
//     setMenuForm(prev => ({
//       ...prev,
//       [name]: name === "order" ? parseInt(value) || 0 : value
//     }));
//   };

//   const validateForm = (data) => {
//     const errors = {};
//     if (!data.title.trim()) errors.title = "Title is required";
//     if (!data.path.trim()) errors.path = "Path is required";
//     if (!data.roleName.trim()) errors.roleName = "Role Name is required";
//     if (data.order <= 0) errors.order = "Order must be greater than 0"; 
    
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
//         id: editingMenu ? editingMenu.id : null
//       };

//       if (editingMenu) {
//         // Update existing menu
//         await api.put(`Menus/update/${menuData.id}/${menuId}`, menuData);
//         toast.success("Menu updated successfully");
//       } else {
//         // Create new menu
//         await api.post(`Menus/create/${menuId}`, menuData);
//         toast.success("Menu created successfully");
//       }

//       // Reset form and fetch updated menus
//       resetMenuForm();
//       setEditingMenu(null);
//       fetchMenus();
//     } catch (error) {
//       console.error("Error saving menu:", error);
//       toast.error("Failed to save menu");
//     }
//   };

//   const resetMenuForm = () => {
//     setMenuForm({
//       title: "",
//       icon: "",
//       path: "",
//       order: 0,
//       roleName: ""
//     });
//     setFormErrors({});
//   };

//   const handleEdit = (menu) => {
//     setEditingMenu(menu);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this menu?")) {
//       try {
//         await api.delete(`Menus/${id}/${menuId}`);
//         toast.success("Menu deleted successfully");
//         fetchMenus();
//       } catch (error) {
//         console.error("Error deleting menu:", error);
//         toast.error("Failed to delete menu");
//       }
//     }
//   };

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const clearSearch = () => {
//     setSearchQuery("");
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar Menu */}
//       <Sidebar activePage="/menu-management" />

//       {/* Main Content */}
//       <div className="flex-1 p-8 overflow-auto">
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
//             <MenuIcon className="w-6 h-6 text-blue-600" />
//             Menu Management
//           </h1>

//           {/* Menu Form */}
//           <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//             <h2 className="text-xl font-semibold mb-4">
//               {editingMenu ? "Edit Menu" : "Create New Menu"}
//             </h2>
//             <form onSubmit={handleSubmitMenu} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Title
//                   </label>
//                   <input
//                     name="title"
//                     value={menuForm.title}
//                     onChange={handleMenuFormChange}
//                     className="w-full p-2 border rounded-md"
//                     min={1} 
//                   />
//                   {formErrors.title && (
//                     <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Icon
//                   </label>
//                   <select
//                     name="icon"
//                     value={menuForm.icon}
//                     onChange={handleMenuFormChange}
//                     className="w-full p-2 border rounded-md"
//                   >
//                     <option value="">Select an icon</option>
//                     {iconOptions.map((icon) => (
//                       <option key={icon} value={icon}>
//                         {icon}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Path
//                   </label>
//                   <input
//                     name="path"
//                     value={menuForm.path}
//                     onChange={handleMenuFormChange}
//                     className="w-full p-2 border rounded-md"
//                   />
//                   {formErrors.path && (
//                     <p className="text-red-500 text-sm mt-1">{formErrors.path}</p>
//                   )}       
//                 </div>

//                 <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Role Name
//                 </label>
//                 <input
//                   name="roleName"
//                   value={menuForm.roleName || ""}
//                   onChange={handleMenuFormChange}
//                   className="w-full p-2 border rounded-md"
//                   placeholder="e.g. Admin, Manager"
//                 />
//                 {formErrors.roleName && (
//                   <p className="text-red-500 text-sm mt-1">{formErrors.roleName}</p>
//                 )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Order
//                   </label>
//                   <input
//                     type="number"
//                     name="order"
//                     value={menuForm.order}
//                     onChange={handleMenuFormChange}
//                     className="w-full p-2 border rounded-md"
//                   />
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 {canAdd && (
//                 <button
//                   type="submit"
//                   className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-blue-700"
//                 >
//                   <Save className="w-4 h-4" />
//                   {editingMenu ? "Update Menu" : "Save Menu"}
//                 </button>
//                 )}
//                 {editingMenu && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       resetMenuForm();
//                       setEditingMenu(null);
//                     }}
//                     className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//                   >
//                     Cancel
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>

//           {/* Menu List with Search */}
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Menu List</h2>
//               <div className="relative">
//                 <div className="flex items-center border rounded-md pr-2">
//                   <input
//                     type="text"
//                     placeholder="Search menus..."
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                     className="p-2 w-64 rounded-md focus:outline-none"
//                   />
//                   {searchQuery ? (
//                     <button 
//                       onClick={clearSearch}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       ✕
//                     </button>
//                   ) : (
//                     <Search className="w-4 h-4 text-gray-500" />
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             {loading ? (
//               <div className="flex justify-center items-center h-40">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
//               </div>
//             ) : filteredMenus.length === 0 ? (
//               <p className="text-gray-500 text-center py-4">
//                 {searchQuery ? "No menus match your search" : "No menus found"}
//               </p>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full table-auto">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Title
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Icon
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Path
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Order
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredMenus.map((menu) => (
//                       <tr key={menu.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">{menu.title}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{menu.icon || "-"}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{menu.path}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{menu.order}</td>
//                         <td className="px-4 py-2">{menu.roleName}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex space-x-2">
//                             {canEdit && (
//                             <button
//                               onClick={() => handleEdit(menu)}
//                               className="text-blue-600 hover:text-blue-800"
//                             >
//                               <Edit className="w-5 h-5" />
//                             </button>
//                             )}
//                             {canDelete && (
//                             <button
//                               onClick={() => handleDelete(menu.id)}
//                               className="text-red-600 hover:text-red-800"
//                             >
//                               <Trash2 className="w-5 h-5" />
//                             </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MenuManagement;




