import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from './axiosInstance';
import Sidebar from './Sidebar';

const RoleManagement = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);

  const canAdd = userPermissions.includes("Add");
  const canEdit = userPermissions.includes("Edit");
  const canDelete = userPermissions.includes("Delete");

  const menuId = "4C0F3D47-9318-4AED-AB36-A85E78C5CDA8";    

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permission")) || [];
    setUserPermissions(storedPermissions);
  }, []);

  const fetchRoles = async () => {
    try {
          const token = localStorage.getItem('token');
      const response = await api.get(`Roles/${menuId}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
      });
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles', {
        icon: '❌',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`Roles/${id}/${menuId}`);
      setRoles((prevRoles) => prevRoles.filter((role) => role.roleID !== id));
      toast.success('Role deleted successfully', {
        icon: '🗑️',
        duration: 3000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-lg">
                        No roles found for the search query. 🎯
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
      </div>
    </div>
  );
};

export default RoleManagement;
