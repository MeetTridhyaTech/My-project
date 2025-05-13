import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash, User, Users, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import Pagination from "./Pagination";
import Sidebar from "./Sidebar"; // Import the Sidebar component
import api from "./axiosInstance";

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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(""); // Clear previous errors

      try {
        const params = {
          pageNumber: currentPage,
          pageSize: pageSize,
          sortBy: sortBy,
          isDescending: sortOrder === "asc" ? true : false,
        };

        if (searchTerm.trim()) {
          params.searchQuery = searchTerm;
        }

        // Simulate network delay for testing loading state
        // Remove this setTimeout in production
        setTimeout(async () => {
          try {
            const response = await api.get(`User/search`, { params });

            console.log("API Response:", response.data);

            if (response.data && Array.isArray(response.data.data)) {
              setUsers(response.data.data);
              setTotalPages(response.data.totalPages || 1);
              setTotalRecord(response.data.totalRecords || 0);
            } else {
              throw new Error("Invalid API response format.");
            }
          } catch (error) {
            console.error("Fetch Users Error:", error);

            if (error.response?.status === 404) {
              setUsers([]); // Set an empty list when no users are found
            } else {
              setError(error.response?.data?.message || "Failed to fetch user data.");
            }
          } finally {
            setLoading(false);
          }
        }, 1000); // 1 second delay for testing - remove in production
      } catch (error) {
        console.error("Fetch Users Error:", error);
        setError(error.message || "An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm]);

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
      await api.delete(`/user/${id}`);
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

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = users.length < pageSize ? (currentPage - 1) * pageSize + users.length : startRecord + pageSize - 1;

  // LoadingSpinner component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-800 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading users data...</p>
    </div>
  );

  // Loading skeleton for table rows
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
      {/* Integrate the Sidebar component */}
      <Sidebar activePage="/userlist" />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-8 h-8 text-gray-700" /> Users
          </h1>
          {/* search bar */}
          <input
            type="text"
            placeholder="Search users..."
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      <button
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-md transition-transform duration-300 transform hover:scale-105 shadow-md"
        onClick={() => navigate("/adduser")}
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Add User</span>
      </button>
        </div>

        {/* page size selector */}
        <div className="mb-4 flex items-center gap-4">
          <span className="text-gray-700 font-semibold">PageSize:</span>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            disabled={loading} // Disable during loading
          >
            {[5, 10, 15, 20].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Display record counts when not loading */}
        {!loading && (
          <p className="text-gray-700 text-sm mb-4">
            Showing {users.length > 0 ? `${startRecord} - ${endRecord} of ${totalRecords}` : "0"} records
          </p>
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
                      className="p-4 text-left cursor-pointer"
                      onClick={() => !loading && handleSort(column)}
                    >
                      {column.charAt(0).toUpperCase() + column.slice(1)}
                      {sortBy === column && (sortOrder === "asc" ?
                        <ChevronDown className="w-4 h-4 inline-block" /> :
                        <ChevronUp className="w-4 h-4 inline-block" />
                      )}
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
                          <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center gap-1
                          transition-transform transform hover:scale-110 hover:shadow-lg"
                            onClick={() => navigate(`/edit-user/${user.id}`)}>
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center gap-1
                          transition-transform transform hover:scale-110 hover:shadow-lg"
                            onClick={() => handleDelete(user.id)}>
                            <Trash className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          )}
        </div>

        {/* Disable pagination during loading */}
        {loading ? (
          <div className="mt-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ListUser;