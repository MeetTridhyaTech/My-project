import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash, User, Plus, ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "./Pagination";
import Sidebar from "./Sidebar";
import api from "./axiosInstance";
import Select from "react-select";

const ListUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("FirstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRecords, setTotalRecord] = useState(0);
  const [filters, setFilters] = useState([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [filterInput, setFilterInput] = useState("");
  const [filterCondition, setFilterCondition] = useState("contains");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const filterButtonRefs = useRef({});

  // Define column types (string or number)
  const columnTypes = {
    FirstName: "string",
    LastName: "string",
    Mobile: "number",
    Email: "string",
    RoleName: "string"
  };

  // Updated condition options based on your requirements
  const getConditionOptions = (columnName) => {
    const type = columnTypes[columnName] || "string";
    
    if (type === "string") {
      return [
        { value: "contains", label: "Contains" },
        { value: "notcontains", label: "Not Contains" },
        { value: "startswith", label: "Starts With" },
        { value: "endswith", label: "Ends With" }
      ];
    } else {
      // For number/int columns like Mobile
      return [
        { value: "equals", label: "Equals" },
        { value: "notequals", label: "Not Equals" },
      ];
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const [userPermissions, setUserPermissions] = useState([]);
  const canAdd = userPermissions.includes("Add");
  const canEdit = userPermissions.includes("Edit");
  const canDelete = userPermissions.includes("Delete");
  const mimicUser = userPermissions.includes("Mimic");

  const pageSizeOptions = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 15, label: "15" },
    { value: 20, label: "20" },
  ];

  const menuId = "17DEC13F-8C9F-4287-A918-774375AC1B76";

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
    setUserPermissions(storedPermissions);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          pageNumber: currentPage,
          pageSize: pageSize,
          sortBy: sortBy,
          isDescending: sortOrder === "desc",
        };

        if (searchTerm.trim()) {
          params.searchQuery = searchTerm;
        }

        if (filters.length > 0) {
          params.filters = filters;
        }

        setTimeout(async () => {
          try {
            const response = await api.post(`User/search/${menuId}`, params);
            if (response.data && Array.isArray(response.data.data)) {
              const fetchedUsers = response.data.data;
              const total = response.data.totalRecords || 0;
              const totalPagesFetched = response.data.totalPages || 1;

              if (fetchedUsers.length === 0 && currentPage > 1) {
                setCurrentPage(1);
              } else {
                setUsers(fetchedUsers);
                setTotalPages(totalPagesFetched);
                setTotalRecord(total);
              }
            } else {
              throw new Error("Invalid API response format.");
            }
          } catch (error) {
            if (error.response?.status === 404) {
              setUsers([]);
            } else {
              setError(error.response?.data?.message || "Failed to fetch user data.");
            }
          } finally {
            setLoading(false);
          }
        }, 1000);
      } catch (error) {
        setError(error.message || "An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm, filters]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/user/${id}/${menuId}`);
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully", {
        icon: "🗑️",
        duration: 3000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user", {
        icon: "❌",
        duration: 3000,
      });
    }
  };

  const handleAddFilter = (columnName, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Position popup near the column header (align with the button)
    setPopupPosition({
      top: buttonRect.bottom + scrollTop + 5, // 5px below the button
      left: buttonRect.left + scrollLeft - 100 // Align popup closer to the button
    });
    
    setActiveFilterColumn(columnName);
    setFilterInput("");
    // Set default condition based on column type
    setFilterCondition(columnTypes[columnName] === "number" ? "equals" : "contains");
  };

  const applyFilter = () => {
    if (!filterInput.trim() || !activeFilterColumn) return;

    const newFilter = {
      columnName: activeFilterColumn,
      condition: filterCondition,
      value: filterInput.trim(),
    };

    // Check if filter already exists for this column
    const existingFilterIndex = filters.findIndex(
      (f) => f.columnName === activeFilterColumn
    );

    if (existingFilterIndex >= 0) {
      // Update existing filter
      const updatedFilters = [...filters];
      updatedFilters[existingFilterIndex] = newFilter;
      setFilters(updatedFilters);
    } else {
      // Add new filter
      setFilters([...filters, newFilter]);
    }

    setCurrentPage(1);
    setActiveFilterColumn(null);
  };

  const clearColumnFilter = (columnName) => {
    setFilters(filters.filter((f) => f.columnName !== columnName));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters([]);
    setCurrentPage(1);
  };

  const handleMimic = async (id) => {
    if (!window.confirm("Do you want to mimic this user?")) return;

    try {
      const response = await api.get(`user/mimic/${id}/${menuId}`);
      const data = response.data.data;

      if (!data || !data.token) throw new Error("No token received.");

      const { token, roleName, roleID, permissions } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("roleName", roleName);
      localStorage.setItem("roleID", roleID);
      localStorage.setItem("permission", JSON.stringify(permissions));

      toast.success("Mimic successful! Reloading as mimicked user...", {
        icon: "🧑‍💼",
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mimic user.", {
        icon: "❌",
      });
    }
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = users.length < pageSize
    ? (currentPage - 1) * pageSize + users.length
    : startRecord + pageSize - 1;

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-800 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading users data...</p>
    </div>
  );

  const TableSkeleton = () => (
    <tbody>
      {[...Array(pageSize)].map((_, index) => (
        <tr key={index} className="border-b animate-pulse">
          {[...Array(6)].map((_, cellIndex) => (
            <td key={cellIndex} className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/userlist" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-8 h-8 text-gray-700" /> Users
          </h1>

          <input
            type="text"
            placeholder="Search users..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 w-1/3"
            value={searchTerm}
            onChange={handleSearch}
          />
          {canAdd && (
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-md transition-transform duration-300 transform hover:scale-105 shadow-md"
              onClick={() => navigate("/adduser")}
            >
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          )}
        </div>

        <div className="mb-4 flex items-center gap-4">
          <span className="text-gray-700 font-semibold">PageSize:</span>
          <div className="w-32">
            <Select
              isDisabled={loading}
              value={pageSizeOptions.find(option => option.value === pageSize)}
              onChange={(selectedOption) => setPageSize(selectedOption.value)}
              options={pageSizeOptions}
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {!loading && (
          <p className="text-gray-700 text-sm mb-4">
            Showing {users.length > 0 ? `${startRecord} - ${endRecord} of ${totalRecords}` : "0"} records
          </p>
        )}

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

        <div className="shadow-lg rounded-xl bg-white p-6 w-full max-w-full mx-auto">
          {error ? (
            <div className="p-4 mb-4 text-center text-red-500 bg-red-100 rounded-lg">
              <p className="font-medium">{error}</p>
              <button
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  {["FirstName", "LastName", "Mobile", "Email", "RoleName"].map((column) => (
                    <th
                      key={column}
                      className="p-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="cursor-pointer"
                          onClick={() => !loading && handleSort(column)}
                        >
                          {column}
                          {sortBy === column && (sortOrder === "asc" ?
                            <ChevronDown className="w-4 h-4 inline-block" /> :
                            <ChevronUp className="w-4 h-4 inline-block" />
                          )}
                        </span>
                        <button
                          ref={(el) => filterButtonRefs.current[column] = el}
                          onClick={(e) => handleAddFilter(column, e)}
                          className={`p-1 rounded ${filters.some(f => f.columnName === column) ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                        >
                          <Filter size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              {loading ? (
                <TableSkeleton />
              ) : (
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">No users available.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b transition duration-200 hover:bg-gray-200">
                        <td className="p-4">{user.firstName || "N/A"}</td>
                        <td className="p-4">{user.lastName || "N/A"}</td>
                        <td className="p-4">{user.mobile || "N/A"}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.roleName || "N/A"}</td>
                        <td className="p-4 flex gap-2">
                          {canEdit && (
                            <button
                              className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center gap-1 transition-transform transform hover:scale-110 hover:shadow-lg"
                              onClick={() => navigate(`/edit-user/${user.id}`)}
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                          )}

                          {canDelete && (
                            <button
                              className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center gap-1 transition-transform transform hover:scale-110 hover:shadow-lg"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash className="w-4 h-4" /> Delete
                            </button>
                          )}
                          {mimicUser && (
                            <button
                              className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-md flex items-center gap-1 transition-transform transform hover:scale-110 hover:shadow-lg"
                              onClick={() => handleMimic(user.id)}
                            >
                              🤖 Mimic
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          )}
        </div>

        {/* Updated Filter Popup - positioned near button with transparent background */}
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
                  placeholder={`Enter value`}
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

        {loading ? (
          <div className="mt-4 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
};

export default ListUser;