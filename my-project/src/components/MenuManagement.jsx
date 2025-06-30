import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Menu as MenuIcon, Save, Trash2, Edit, ChevronDown, X } from "lucide-react";
import Sidebar from "./Sidebar";
import TableFilter from "./TableFilter";
import GlobalLoader from "./GlobalLoader";
import {
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  fetchRoles,
  resetStatus
} from "../../features/menus/menuSlice"; // Adjust path as needed

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
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    menus = [], 
    availableRoles = [], 
    loading, 
    rolesLoading, 
    error, 
    success, 
    operationType 
  } = useSelector((state) => state.menus);

  // Local state
  const [editingMenu, setEditingMenu] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);

  // Define column types for the filter
  const columnTypes = {
    title: "string",
    icon: "string", 
    path: "string",
    order: "number",
    roleName: "string"
  };

  // Columns to show in the table
  const columns = ["title", "icon", "path", "order", "roleName"];

  const canAdd = userPermissions.includes("Add");
  const canEdit = userPermissions.includes("Edit");
  const canDelete = userPermissions.includes("Delete");

  // Form states
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
    "ShoppingCart",
    "MessageCircle "
  ];

  // Load user permissions
  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
    setUserPermissions(storedPermissions);
  }, []);

  // Fetch menus and roles on component mount
  useEffect(() => {
    dispatch(fetchMenus(menuId));
    dispatch(fetchRoles(menuId));
  }, [dispatch, menuId]);

  // Handle Redux state changes (success/error)
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(resetStatus());
      
      // Reset form and editing state on successful create/update
      if (operationType === 'create' || operationType === 'update') {
        resetMenuForm();
        setEditingMenu(null);
        // Refresh menus list
        dispatch(fetchMenus(menuId));
      }
    }

    if (error) {
      toast.error(error);
      dispatch(resetStatus());
    }
  }, [success, error, operationType, dispatch, menuId]);

  // Filter menus when filters or menus change
  useEffect(() => {
    if (filters.length === 0) {
      setFilteredMenus(menus);
      return;
    }

    const filtered = menus.filter(menu => {
      return filters.every(filter => {
        let columnValue = menu[filter.columnName] || '';
        // Handle roleName specially since it's a comma-separated string
        if (filter.columnName === 'roleName') {
          columnValue = columnValue.split(',').map(r => r.trim()).join(', ');
        }
        columnValue = String(columnValue).toLowerCase();
        const filterValue = filter.value.toLowerCase();
        
        switch (filter.condition) {
          case "contains":
            return columnValue.includes(filterValue);
          case "notcontains":
            return !columnValue.includes(filterValue);
          case "startswith":
            return columnValue.startsWith(filterValue);
          case "endswith":
            return columnValue.endsWith(filterValue);
          case "equals":
            return columnValue === filterValue;
          case "notequals":
            return columnValue !== filterValue;
          default:
            return true;
        }
      });
    });

    setFilteredMenus(filtered);
  }, [filters, menus]);

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

    const menuData = {
      ...menuForm,
      roleName: menuForm.roleNames.join(', '),
      id: editingMenu ? editingMenu.id : null
    };

    if (editingMenu) {
      dispatch(updateMenu({ menuData, menuId }));
    } else {
      dispatch(createMenu({ menuData, menuId }));
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
      dispatch(deleteMenu({ id, menuId }));
    }
  };

  const handleApplyFilter = (newFilter) => {
    setFilters(prev => {
      const existingIndex = prev.findIndex(f => f.columnName === newFilter.columnName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newFilter;
        return updated;
      }
      return [...prev, newFilter];
    });
  };

  const handleClearColumnFilter = (columnName) => {
    setFilters(prev => prev.filter(f => f.columnName !== columnName));
  };

  const handleResetFilters = () => {
    setFilters([]);
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                  {formErrors.path && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.path}</p>
                  )}       
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Names
                    {rolesLoading && <span className="text-sm text-gray-500"> (Loading...)</span>}
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
                    disabled={loading}
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
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : (editingMenu ? "Update Menu" : "Save Menu")}
                  </button>
                )}
                {editingMenu && (
                  <button
                    type="button"
                    onClick={() => {
                      resetMenuForm();
                      setEditingMenu(null);
                    }}
                    disabled={loading}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Menu List with Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Menu List</h2>
            </div>
            
            {/* Active Filters Display */}
            {filters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 mb-4">
                {filters.map((filter, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span className="font-medium">{filter.columnName}</span>
                    <span className="text-sm">{filter.condition}</span>
                    <span className="font-semibold">"{filter.value}"</span>
                    <button 
                      onClick={() => handleClearColumnFilter(filter.columnName)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                      title="Clear this filter"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                >
                  <X size={14} /> Clear All Filters
                </button>
              </div>
            )}
            
            {loading ? (
              // <div className="flex justify-center items-center h-40">
              //   <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              // </div>
                                          <GlobalLoader message="Loading menus..." />

            ) : filteredMenus.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {filters.length ? "No menus match your filters" : "No menus found"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map(column => (
                        <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            {column.charAt(0).toUpperCase() + column.slice(1)}
                            <TableFilter
                              columns={[column]}
                              columnTypes={columnTypes}
                              filters={filters.filter(f => f.columnName === column)}
                              onApplyFilter={handleApplyFilter}
                              onClearColumnFilter={handleClearColumnFilter}
                              onResetFilters={handleResetFilters}
                            />
                          </div>
                        </th>
                      ))}
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
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(menu.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
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