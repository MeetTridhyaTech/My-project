// import { useState, useEffect, useRef } from "react";
// // import api from "./axiosInstance";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPermissions, deletePermission, resetStatus } from "../../features/Permissions/permissionSlice";
// import { ShieldCheck, Loader2, Trash2, Plus, Filter, X, ChevronUp, ChevronDown } from "lucide-react";
// import Sidebar from "./Sidebar";
// import { toast, Toaster } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import Select from "react-select";

// const ListPermissions = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // const [permissions, setPermissions] = useState([]);
//   // const [loading, setLoading] = useState(true);
//   // const [userPermissions, setUserPermissions] = useState([]);
//   const [userPermissions , setUserPermissions] = useState([]);
//   const { permissions, loading, success, error } = useSelector((state) => state.permissions);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortBy, setSortBy] = useState("name");
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [filters, setFilters] = useState([]);
//   const [activeFilterColumn, setActiveFilterColumn] = useState(null);
//   const [filterInput, setFilterInput] = useState("");
//   const [filterCondition, setFilterCondition] = useState("contains");
//   const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
//   const filterButtonRefs = useRef({});

//   // const canRead = userPermissions.includes("Read");
//   const canAdd = userPermissions.includes("Add");
//   const canDelete = userPermissions.includes("Delete");

//   const menuId = "6223D2F6-C7D5-4BCE-A300-FF39FFD46B11";

//   // Define column types for filtering
//   const columnTypes = {
//     name: "string"
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
//     const storedPermissions = JSON.parse(localStorage.getItem(`permission`)) || [];
//     setUserPermissions(storedPermissions);
//   }, []);

//     useEffect(() => {
//     if (canRead) {
//       dispatch(fetchPermissions(menuId));
//     }
//   }, [dispatch, menuId, canRead]);      

//   useEffect(() => {
//     if (success) {
//       toast.success("Operation completed successfully ✅");
//       dispatch(resetStatus());
//       // Refetch permissions after successful operation
//       dispatch(fetchPermissions(menuId));
//     }
    
//     if (error) {
//       toast.error(error || "An error occurred ❌");
//       dispatch(resetStatus());
//     }
//   }, [success, error, dispatch, menuId]);

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this permission?");
//     if (!confirmDelete) return;

//     toast.loading("Deleting permission...", { id: "deletePermission" });
    
//     try {
//       dispatch(deletePermission({ id, menuId }));
//       toast.success("Permission deleted successfully ✅", { id: "deletePermission" });
//     } catch (error) {
//       toast.error("Failed to delete permission ❌", { id: "deletePermission" });
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

//   // Apply filters and sorting to permissions
//   const getFilteredAndSortedPermissions = () => {
//     let filteredPermissions = permissions.filter((permission) =>
//       permission.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
    

//     // Apply custom filters
//     filters.forEach(filter => {
//       filteredPermissions = filteredPermissions.filter(permission => {
//         const value = permission[filter.columnName]?.toString().toLowerCase() || "";
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
//     filteredPermissions.sort((a, b) => {
//       const aValue = a[sortBy]?.toString().toLowerCase() || "";
//       const bValue = b[sortBy]?.toString().toLowerCase() || "";
      
//       if (sortOrder === "asc") {
//         return aValue.localeCompare(bValue);
//       } else {
//         return bValue.localeCompare(aValue);
//       }
//     });

//     return filteredPermissions;
//   };

//   const filteredPermissions = getFilteredAndSortedPermissions();

//   useEffect(() => {
//     fetchPermissions();
//   }, []);

//   return (
//     <div className="flex font-sans">
//       <Sidebar activePage="/list-permissions" />
//       <Toaster position="top-right" />

//       <div className="w-full md:w-4/5 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen p-4 sm:p-8 transition-all duration-300">
//         <div className="max-w-6xl mx-auto">
//           {/* Header Section */}
//           <div className="flex justify-between items-center mb-10">
//             <div className="flex items-center gap-3">
//               <ShieldCheck className="text-blue-600" size={32} />
//               <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
//                 All Permissions
//               </h1>
//             </div>
//             {canAdd && (
//               <button
//                 onClick={() => navigate("/addpermission")}
//                 className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-md shadow-md transition-transform duration-300 hover:scale-105"
//               >
//                 <Plus className="w-5 h-5" />
//                 <span>Add Permission</span>
//               </button>
//             )}
//           </div>

//           {/* Search Bar */}
//           <div className="mb-6">
//             <input
//               type="text"
//               placeholder="Search permissions..."
//               className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
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

//           {/* Table or Content */}
//           {canRead && (
//             <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300">
//               {loading ? (
//                 <div className="flex justify-center items-center py-20">
//                   <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
//                 </div>
//               ) : filteredPermissions.length === 0 ? (
//                 <p className="text-center text-gray-500 py-20 text-lg font-medium animate-fade-in">
//                   {searchQuery || filters.length > 0 ? '🔍 No permissions found for the current search/filter criteria.' : '🚫 No permissions found.'}
//                 </p>
//               ) : (
//                 <table className="w-full table-auto text-left border-collapse">
//                   <thead>
//                     <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-bold tracking-wider">
//                       <th className="py-4 px-6 border-b border-blue-300">Id</th>
//                       <th className="py-4 px-6 border-b border-blue-300">
//                         <div className="flex items-center justify-between">
//                           <span 
//                             className="cursor-pointer"
//                             onClick={() => !loading && handleSort("name")}
//                           >
//                             Permission Name
//                             {sortBy === "name" && (sortOrder === "asc" ?
//                               <ChevronDown className="w-4 h-4 inline-block ml-1" /> :
//                               <ChevronUp className="w-4 h-4 inline-block ml-1" />
//                             )}
//                           </span>
//                           <button
//                             ref={(el) => filterButtonRefs.current["name"] = el}
//                             onClick={(e) => handleAddFilter("name", e)}
//                             className={`p-1 rounded ${filters.some(f => f.columnName === "name") ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
//                           >
//                             <Filter size={16} />
//                           </button>
//                         </div>
//                       </th>
//                       <th className="py-4 px-6 border-b border-blue-300">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredPermissions.map((perm, index) => (
//                       <tr
//                         key={perm.id}
//                         className="group hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-in-out"
//                       >
//                         <td className="py-3 px-6 border-b border-gray-200 font-semibold text-gray-600">
//                           {index + 1}
//                         </td>
//                         <td className="py-3 px-6 border-b border-gray-200 font-medium text-gray-800">
//                           {perm.name}
//                         </td>
//                         <td className="py-3 px-6 border-b border-gray-200">
//                           <div className="flex gap-4">
//                             {canDelete && (
//                               <button
//                                 onClick={() => handleDelete(perm.id)}
//                                 className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-800 transition-all duration-300 ease-in-out group-hover:scale-105"
//                               >
//                                 <Trash2 size={16} />
//                                 Delete
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
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

// export default ListPermissions;



import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, Loader2, Trash2, Plus, Filter, X, ChevronUp, ChevronDown } from "lucide-react";
import Sidebar from "./Sidebar";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import { fetchPermissions, deletePermission, resetStatus } from "../../features/Permissions/permissionSlice";

const ListPermissions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { data: permissions = [], loading, error, success } = useSelector((state) => state.permissions);
  
  // Local state
  const [userPermissions, setUserPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [filterInput, setFilterInput] = useState("");
  const [filterCondition, setFilterCondition] = useState("contains");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const filterButtonRefs = useRef({});

  const canRead = userPermissions.includes("Read");
  const canAdd = userPermissions.includes("Add");
  const canDelete = userPermissions.includes("Delete");

  const menuId = "6223D2F6-C7D5-4BCE-A300-FF39FFD46B11";

  // Define column types for filtering
  const columnTypes = {
    name: "string"
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
    const storedPermissions = JSON.parse(localStorage.getItem(`permission`)) || [];
    setUserPermissions(storedPermissions);
  }, []);

  // Fetch permissions on component mount
  useEffect(() => {
    if (canRead) {
      dispatch(fetchPermissions(menuId));
    }
  }, [dispatch, menuId, canRead]);

  // Handle Redux state changes (success/error)
  useEffect(() => {
    if (success) {
      toast.success("Permission deleted successfully ✅");
      dispatch(resetStatus());
      dispatch(fetchPermissions(menuId));
    }
    
    if (error) {
      toast.error(error || "An error occurred ❌");
      dispatch(resetStatus());
    }
  }, [success, error, dispatch, menuId]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this permission?");
    if (!confirmDelete) return;

    toast.loading("Deleting permission...", { id: "deletePermission" });
    
    try {
      dispatch(deletePermission({ id, menuId }));
      toast.success("Permission deleted successfully ✅", { id: "deletePermission" });
    } catch (error) {
      toast.error("Failed to delete permission ❌", { id: "deletePermission" });
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

  // Apply filters and sorting to permissions
  const getFilteredAndSortedPermissions = () => {
    let filteredPermissions = permissions.filter((permission) =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply custom filters
    filters.forEach(filter => {
      filteredPermissions = filteredPermissions.filter(permission => {
        const value = permission[filter.columnName]?.toString().toLowerCase() || "";
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
    filteredPermissions.sort((a, b) => {
      const aValue = a[sortBy]?.toString().toLowerCase() || "";
      const bValue = b[sortBy]?.toString().toLowerCase() || "";
      
      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filteredPermissions;
  };

  const filteredPermissions = getFilteredAndSortedPermissions();

  return (
    <div className="flex font-sans">
      <Sidebar activePage="/list-permissions" />
      <Toaster position="top-right" />

      <div className="w-full md:w-4/5 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen p-4 sm:p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={32} />
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                All Permissions
              </h1>
            </div>
            {canAdd && (
              <button
                onClick={() => navigate("/addpermission")}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-md shadow-md transition-transform duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Permission</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search permissions..."
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
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

          {/* Table or Content */}
          {canRead && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                </div>
              ) : filteredPermissions.length === 0 ? (
                <p className="text-center text-gray-500 py-20 text-lg font-medium animate-fade-in">
                  {searchQuery || filters.length > 0 ? '🔍 No permissions found for the current search/filter criteria.' : '🚫 No permissions found.'}
                </p>
              ) : (
                <table className="w-full table-auto text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-bold tracking-wider">
                      <th className="py-4 px-6 border-b border-blue-300">Id</th>
                      <th className="py-4 px-6 border-b border-blue-300">
                        <div className="flex items-center justify-between">
                          <span 
                            className="cursor-pointer"
                            onClick={() => !loading && handleSort("name")}
                          >
                            Permission Name
                            {sortBy === "name" && (sortOrder === "asc" ?
                              <ChevronDown className="w-4 h-4 inline-block ml-1" /> :
                              <ChevronUp className="w-4 h-4 inline-block ml-1" />
                            )}
                          </span>
                          <button
                            ref={(el) => filterButtonRefs.current["name"] = el}
                            onClick={(e) => handleAddFilter("name", e)}
                            className={`p-1 rounded ${filters.some(f => f.columnName === "name") ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
                          >
                            <Filter size={16} />
                          </button>
                        </div>
                      </th>
                      <th className="py-4 px-6 border-b border-blue-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermissions.map((perm, index) => (
                      <tr
                        key={perm.id}
                        className="group hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-in-out"
                      >
                        <td className="py-3 px-6 border-b border-gray-200 font-semibold text-gray-600">
                          {index + 1}
                        </td>
                        <td className="py-3 px-6 border-b border-gray-200 font-medium text-gray-800">
                          {perm.name}
                        </td>
                        <td className="py-3 px-6 border-b border-gray-200">
                          <div className="flex gap-4">
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(perm.id)}
                                className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-800 transition-all duration-300 ease-in-out group-hover:scale-105"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

export default ListPermissions;