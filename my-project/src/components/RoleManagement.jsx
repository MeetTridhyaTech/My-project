// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Edit, Trash2, ShieldCheck } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import api from './axiosInstance';
// import Sidebar from './Sidebar';

// const RoleManagement = () => {
//   const navigate = useNavigate();
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [userPermissions, setUserPermissions] = useState([]);

//   const canAdd = userPermissions.includes("Add");
//   const canEdit = userPermissions.includes("Edit");
//   const canDelete = userPermissions.includes("Delete");

//   const menuId = "4C0F3D47-9318-4AED-AB36-A85E78C5CDA8";    

//   useEffect(() => {
//     const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
//     setUserPermissions(storedPermissions);
//   }, []);

//   const fetchRoles = async () => {
//     try {
//           const token = localStorage.getItem('token');
//       const response = await api.get(`Roles/${menuId}`,{
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       });
//       setRoles(response.data || []);
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       toast.error('Failed to fetch roles', {
//         icon: '❌',
//         duration: 3000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   const handleDeleteRole = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this role?')) return;
//     try {
//       await api.delete(`Roles/${id}/${menuId}`);
//       setRoles((prevRoles) => prevRoles.filter((role) => role.roleID !== id));
//       toast.success('Role deleted successfully', {
//         icon: '🗑️',
//         duration: 3000,
//       });
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to delete role', {
//         icon: '❌',
//         duration: 3000,
//       });
//     }
//   };

//   const filteredRoles = roles.filter((role) =>
//     role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const TableSkeleton = () => (
//     <div className="animate-pulse">
//       <div className="h-12 bg-gray-200 rounded mb-4"></div>
//       {[...Array(5)].map((_, index) => (
//         <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar activePage="/rolemanagement" />

//       <div className="flex-1 p-8">
//         <div className="bg-white shadow-lg rounded-2xl p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
//               <ShieldCheck className="w-8 h-8 text-gray-600" />
//               <span className="text-xl font-semibold text-gray-800">Role Management</span>
//             </h2>
//             <div className="flex gap-2">
//               {canAdd && (
//                 <button
//                   onClick={() => navigate('/add-role')}
//                   className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 shadow-md"
//                 >
//                   + Add New Role
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="mb-6">
//             <input
//               type="text"
//               placeholder="Search roles..."
//               className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           {loading ? (
//             <TableSkeleton />
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full table-auto">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
//                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredRoles.length === 0 ? (
//                     <tr>
//                       <td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-lg">
//                         No roles found for the search query. 🎯
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredRoles.map((role, index) => (
//                       <tr key={role.roleID} className="hover:bg-gray-100 transition duration-150">
//                         <td className="px-6 py-4 text-sm">{index + 1}</td>
//                         <td className="px-6 py-4 font-semibold text-gray-800">{role.roleName}</td>
//                         <td className="px-6 py-4 flex justify-center gap-4">
//                           {canEdit && (
//                             <button
//                               className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
//                               onClick={() => navigate(`/edit-role/${role.roleID}`)}
//                             >
//                               <Edit className="w-4 h-4" /> Edit
//                             </button>
//                           )}
//                           {canDelete && (
//                             <button
//                               className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
//                               onClick={() => handleDeleteRole(role.roleID)}
//                             >
//                               <Trash2 className="w-4 h-4" /> Delete
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleManagement;



// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Edit, Trash2, ShieldCheck, Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import api from './axiosInstance';
// import Sidebar from './Sidebar';
// import Select from 'react-select';

// const RoleManagement = () => {
//   const navigate = useNavigate();
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [userPermissions, setUserPermissions] = useState([]);
//   const [sortBy, setSortBy] = useState("roleName");
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [filters, setFilters] = useState([]);
//   const [activeFilterColumn, setActiveFilterColumn] = useState(null);
//   const [filterInput, setFilterInput] = useState("");
//   const [filterCondition, setFilterCondition] = useState("contains");
//   const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
//   const filterButtonRefs = useRef({});

//   const canAdd = userPermissions.includes("Add");
//   const canEdit = userPermissions.includes("Edit");
//   const canDelete = userPermissions.includes("Delete");

//   const menuId = "4C0F3D47-9318-4AED-AB36-A85E78C5CDA8";

//   // Define column types for filtering
//   const columnTypes = {
//     roleName: "string"
//   };

//   // Get condition options based on column type
//   const getConditionOptions = (columnName) => {
//     const type = columnTypes[columnName] || "string";
    
//     if (type === "string") {
//       return [
//         { value: "contains", label: "Contains" },
//         { value: "notcontains", label: "Not Contains" },
//         { value: "startswith", label: "Starts With" },
//         { value: "endswith", label: "Ends With" }
//       ];
//     } 
//   };

//   useEffect(() => {
//     const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
//     setUserPermissions(storedPermissions);
//   }, []);

//   const fetchRoles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await api.get(`Roles/${menuId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setRoles(response.data || []);
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       toast.error('Failed to fetch roles', {
//         icon: '❌',
//         duration: 3000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   const handleDeleteRole = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this role?')) return;
//     try {
//       await api.delete(`Roles/${id}/${menuId}`);
//       setRoles((prevRoles) => prevRoles.filter((role) => role.roleID !== id));
//       toast.success('Role deleted successfully', {
//         icon: '🗑️',
//         duration: 3000,
//       });
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to delete role', {
//         icon: '❌',
//         duration: 3000,
//       });
//     }
//   };

//   const handleSort = (column) => {
//     if (sortBy === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortBy(column);
//       setSortOrder("desc");
//     }
//   };

//   const handleAddFilter = (columnName, event) => {
//     const buttonRect = event.currentTarget.getBoundingClientRect();
//     const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
//     const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
//     setPopupPosition({
//       top: buttonRect.bottom + scrollTop + 5,
//       left: buttonRect.left + scrollLeft - 100
//     });
    
//     setActiveFilterColumn(columnName);
//     setFilterInput("");
//     // setFilterCondition(columnTypes[columnName] === "number" ? "equals" : "contains");
//   };

//   const applyFilter = () => {
//     if (!filterInput.trim() || !activeFilterColumn) return;

//     const newFilter = {
//       columnName: activeFilterColumn,
//       condition: filterCondition,
//       value: filterInput.trim(),
//     };

//     const existingFilterIndex = filters.findIndex(
//       (f) => f.columnName === activeFilterColumn
//     );

//     if (existingFilterIndex >= 0) {
//       const updatedFilters = [...filters];
//       updatedFilters[existingFilterIndex] = newFilter;
//       setFilters(updatedFilters);
//     } else {
//       setFilters([...filters, newFilter]);
//     }

//     setActiveFilterColumn(null);
//   };

//   const clearColumnFilter = (columnName) => {
//     setFilters(filters.filter((f) => f.columnName !== columnName));
//   };

//   const resetFilters = () => {
//     setFilters([]);
//   };

//   // Apply filters and sorting to roles
//   const getFilteredAndSortedRoles = () => {
//     let filteredRoles = roles.filter((role) =>
//       role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     // Apply custom filters
//     filters.forEach(filter => {
//       filteredRoles = filteredRoles.filter(role => {
//         const value = role[filter.columnName]?.toString().toLowerCase() || "";
//         const filterValue = filter.value.toLowerCase();

//         switch (filter.condition) {
//           case "contains":
//             return value.includes(filterValue);
//           case "notcontains":
//             return !value.includes(filterValue);
//           case "startswith":
//             return value.startsWith(filterValue);
//           case "endswith":
//             return value.endsWith(filterValue);
//           default:
//             return true;
//         }
//       });
//     });

//     // Apply sorting
//     filteredRoles.sort((a, b) => {
//       const aValue = a[sortBy]?.toString().toLowerCase() || "";
//       const bValue = b[sortBy]?.toString().toLowerCase() || "";
      
//       if (sortOrder === "asc") {
//         return aValue.localeCompare(bValue);
//       } else {
//         return bValue.localeCompare(aValue);
//       }
//     });

//     return filteredRoles;
//   };

//   const filteredRoles = getFilteredAndSortedRoles();

//   const TableSkeleton = () => (
//     <div className="animate-pulse">
//       <div className="h-12 bg-gray-200 rounded mb-4"></div>
//       {[...Array(5)].map((_, index) => (
//         <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar activePage="/rolemanagement" />

//       <div className="flex-1 p-8">
//         <div className="bg-white shadow-lg rounded-2xl p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
//               <ShieldCheck className="w-8 h-8 text-gray-600" />
//               <span className="text-xl font-semibold text-gray-800">Role Management</span>
//             </h2>
//             <div className="flex gap-2">
//               {canAdd && (
//                 <button
//                   onClick={() => navigate('/add-role')}
//                   className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 shadow-md"
//                 >
//                   + Add New Role
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="mb-6">
//             <input
//               type="text"
//               placeholder="Search roles..."
//               className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           {/* Filter Tags */}
//           {filters.length > 0 && (
//             <div className="mb-4 flex flex-wrap gap-2">
//               {filters.map((filter, index) => (
//                 <div 
//                   key={index} 
//                   className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
//                 >
//                   <span className="font-medium">{filter.columnName}</span>
//                   <span className="text-sm">{filter.condition}</span>
//                   <span className="font-semibold">"{filter.value}"</span>
//                   <button 
//                     onClick={() => clearColumnFilter(filter.columnName)}
//                     className="text-blue-600 hover:text-blue-800 flex items-center"
//                     title="Clear this filter"
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               ))}
//               <button
//                 onClick={resetFilters}
//                 className="flex items-center gap-1 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
//               >
//                 <X size={14} /> Clear All Filters
//               </button>
//             </div>
//           )}

//           {loading ? (
//             <TableSkeleton />
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
//                 <thead className="bg-gray-800 text-white">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                       <div className="flex items-center justify-between">
//                         <span 
//                           className="cursor-pointer"
//                           onClick={() => !loading && handleSort("roleName")}
//                         >
//                           Role Name
//                           {sortBy === "roleName" && (sortOrder === "asc" ?
//                             <ChevronDown className="w-4 h-4 inline-block ml-1" /> :
//                             <ChevronUp className="w-4 h-4 inline-block ml-1" />
//                           )}
//                         </span>
//                         <button
//                           ref={(el) => filterButtonRefs.current["roleName"] = el}
//                           onClick={(e) => handleAddFilter("roleName", e)}
//                           className={`p-1 rounded ${filters.some(f => f.columnName === "roleName") ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`}
//                         >
//                           <Filter size={16} />
//                         </button>
//                       </div>
//                     </th>
//                     <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredRoles.length === 0 ? (
//                     <tr>
//                       <td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-lg">
//                         {searchQuery || filters.length > 0 ? 'No roles found for the current search/filter criteria. 🎯' : 'No roles found. 🎯'}
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredRoles.map((role, index) => (
//                       <tr key={role.roleID} className="hover:bg-gray-100 transition duration-150">
//                         <td className="px-6 py-4 text-sm">{index + 1}</td>
//                         <td className="px-6 py-4 font-semibold text-gray-800">{role.roleName}</td>
//                         <td className="px-6 py-4 flex justify-center gap-4">
//                           {canEdit && (
//                             <button
//                               className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
//                               onClick={() => navigate(`/edit-role/${role.roleID}`)}
//                             >
//                               <Edit className="w-4 h-4" /> Edit
//                             </button>
//                           )}
//                           {canDelete && (
//                             <button
//                               className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
//                               onClick={() => handleDeleteRole(role.roleID)}
//                             >
//                               <Trash2 className="w-4 h-4" /> Delete
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Filter Popup */}
//         {activeFilterColumn && (
//           <div className="absolute inset-0 bg-transparent z-50">
//             <div 
//               className="absolute bg-white p-4 rounded-lg shadow-xl w-80 border"
//               style={{
//                 top: `${popupPosition.top}px`,
//                 left: `${popupPosition.left}px`,
//                 maxHeight: 'calc(100vh - 100px)',
//                 overflowY: 'auto'
//               }}
//             >
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-md font-semibold">
//                   Filter {activeFilterColumn}
//                 </h3>
//                 <button 
//                   onClick={() => setActiveFilterColumn(null)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
              
//               <div className="mb-3">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Condition
//                 </label>
//                 <Select
//                   value={getConditionOptions(activeFilterColumn).find(opt => opt.value === filterCondition)}
//                   onChange={(selected) => setFilterCondition(selected.value)}
//                   options={getConditionOptions(activeFilterColumn)}
//                   classNamePrefix="react-select"
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Value
//                 </label>
//                 <input
//                   type={columnTypes[activeFilterColumn] === "number" ? "number" : "text"}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//                   value={filterInput}
//                   onChange={(e) => setFilterInput(e.target.value)}
//                   placeholder="Enter value"
//                 />
//               </div>
              
//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={() => {
//                     clearColumnFilter(activeFilterColumn);
//                     setActiveFilterColumn(null);
//                   }}
//                   className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={applyFilter}
//                   className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RoleManagement;




import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, ShieldCheck, Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, deleteRole, resetStatus } from '../../features/Roles/RoleSlice'; // Adjust import path as needed
import Sidebar from './Sidebar';
import Select from 'react-select';
import GlobalLoader from './GlobalLoader';

const RoleManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { list: roles, loading, error } = useSelector((state) => state.roles);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [sortBy, setSortBy] = useState("roleName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [filterInput, setFilterInput] = useState("");
  const [filterCondition, setFilterCondition] = useState("contains");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const filterButtonRefs = useRef({});

  const canAdd = userPermissions.includes("Add");
  const canEdit = userPermissions.includes("Edit");
  const canDelete = userPermissions.includes("Delete");

  const menuId = "4C0F3D47-9318-4AED-AB36-A85E78C5CDA8";

  // Define column types for filtering
  const columnTypes = {
    roleName: "string"
  };

  // Get condition options based on column type
  const getConditionOptions = (columnName) => {
    const type = columnTypes[columnName] || "string";
    
    if (type === "string") {
      return [
        { value: "contains", label: "Contains" },
        { value: "notcontains", label: "Not Contains" },
        { value: "startswith", label: "Starts With" },
        { value: "endswith", label: "Ends With" }
      ];
    } 
  };

  // Load user permissions from localStorage
  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
    setUserPermissions(storedPermissions);
  }, []);

  // Fetch roles when component mounts
  useEffect(() => {
    dispatch(fetchRoles(menuId));
  }, [dispatch, menuId]);

  // Handle errors from Redux
  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to perform operation', {
        icon: '❌',
        duration: 3000,
      });
      dispatch(resetStatus());
    }
  }, [error, dispatch]);

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await dispatch(deleteRole({ roleId: id, menuId })).unwrap();
      toast.success('Role deleted successfully', {
        icon: '🗑️',
        duration: 3000,
      });
    } catch (error) {
      toast.error(error || 'Failed to delete role', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleAddFilter = (columnName, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setPopupPosition({
      top: buttonRect.bottom + scrollTop + 5,
      left: buttonRect.left + scrollLeft - 100
    });
    
    setActiveFilterColumn(columnName);
    setFilterInput("");
  };

  const applyFilter = () => {
    if (!filterInput.trim() || !activeFilterColumn) return;

    const newFilter = {
      columnName: activeFilterColumn,
      condition: filterCondition,
      value: filterInput.trim(),
    };

    const existingFilterIndex = filters.findIndex(
      (f) => f.columnName === activeFilterColumn
    );

    if (existingFilterIndex >= 0) {
      const updatedFilters = [...filters];
      updatedFilters[existingFilterIndex] = newFilter;
      setFilters(updatedFilters);
    } else {
      setFilters([...filters, newFilter]);
    }

    setActiveFilterColumn(null);
  };

  const clearColumnFilter = (columnName) => {
    setFilters(filters.filter((f) => f.columnName !== columnName));
  };

  const resetFilters = () => {
    setFilters([]);
  };

  // Apply filters and sorting to roles
  const getFilteredAndSortedRoles = () => {
    if (!roles || !Array.isArray(roles)) return [];
    
    let filteredRoles = roles.filter((role) =>
      role.roleName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply custom filters
    filters.forEach(filter => {
      filteredRoles = filteredRoles.filter(role => {
        const value = role[filter.columnName]?.toString().toLowerCase() || "";
        const filterValue = filter.value.toLowerCase();

        switch (filter.condition) {
          case "contains":
            return value.includes(filterValue);
          case "notcontains":
            return !value.includes(filterValue);
          case "startswith":
            return value.startsWith(filterValue);
          case "endswith":
            return value.endsWith(filterValue);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    filteredRoles.sort((a, b) => {
      const aValue = a[sortBy]?.toString().toLowerCase() || "";
      const bValue = b[sortBy]?.toString().toLowerCase() || "";
      
      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filteredRoles;
  };

  const filteredRoles = getFilteredAndSortedRoles();

  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/rolemanagement" />

      <div className="flex-1 p-8">
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-gray-600" />
              <span className="text-xl font-semibold text-gray-800">Role Management</span>
            </h2>
            <div className="flex gap-2">
              {canAdd && (
                <button
                  onClick={() => navigate('/add-role')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 shadow-md"
                >
                  + Add New Role
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search roles..."
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tags */}
          {filters.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <div 
                  key={index} 
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span className="font-medium">{filter.columnName}</span>
                  <span className="text-sm">{filter.condition}</span>
                  <span className="font-semibold">"{filter.value}"</span>
                  <button 
                    onClick={() => clearColumnFilter(filter.columnName)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                    title="Clear this filter"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
              >
                <X size={14} /> Clear All Filters
              </button>
            </div>
          )}

          {loading ? (
            <GlobalLoader message="Loading roles..." />
            // <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-between">
                        <span 
                          className="cursor-pointer"
                          onClick={() => !loading && handleSort("roleName")}
                        >
                          Role Name
                          {sortBy === "roleName" && (sortOrder === "asc" ?
                            <ChevronDown className="w-4 h-4 inline-block ml-1" /> :
                            <ChevronUp className="w-4 h-4 inline-block ml-1" />
                          )}
                        </span>
                        <button
                          ref={(el) => filterButtonRefs.current["roleName"] = el}
                          onClick={(e) => handleAddFilter("roleName", e)}
                          className={`p-1 rounded ${filters.some(f => f.columnName === "roleName") ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                        >
                          <Filter size={16} />
                        </button>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-lg">
                        {searchQuery || filters.length > 0 ? 'No roles found for the current search/filter criteria. 🎯' : 'No roles found. 🎯'}
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role, index) => (
                      <tr key={role.roleID} className="hover:bg-gray-100 transition duration-150">
                        <td className="px-6 py-4 text-sm">{index + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{role.roleName}</td>
                        <td className="px-6 py-4 flex justify-center gap-4">
                          {canEdit && (
                            <button
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
                              onClick={() => navigate(`/edit-role/${role.roleID}`)}
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
                              onClick={() => handleDeleteRole(role.roleID)}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Filter Popup */}
        {activeFilterColumn && (
          <div className="absolute inset-0 bg-transparent z-50">
            <div 
              className="absolute bg-white p-4 rounded-lg shadow-xl w-80 border"
              style={{
                top: `${popupPosition.top}px`,
                left: `${popupPosition.left}px`,
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto'
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold">
                  Filter {activeFilterColumn}
                </h3>
                <button 
                  onClick={() => setActiveFilterColumn(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <Select
                  value={getConditionOptions(activeFilterColumn).find(opt => opt.value === filterCondition)}
                  onChange={(selected) => setFilterCondition(selected.value)}
                  options={getConditionOptions(activeFilterColumn)}
                  classNamePrefix="react-select"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type={columnTypes[activeFilterColumn] === "number" ? "number" : "text"}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  placeholder="Enter value"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    clearColumnFilter(activeFilterColumn);
                    setActiveFilterColumn(null);
                  }}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilter}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;