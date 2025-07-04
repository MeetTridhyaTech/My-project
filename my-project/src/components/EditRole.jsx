import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { editRole, resetStatus } from '../../features/Roles/RoleSlice';
import api from './axiosInstance';
import Sidebar from './Sidebar';
import { toast } from 'react-hot-toast';

const EditRole = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [roleName, setRoleName] = useState('');
  const { loading, success, error } = useSelector((state) => state.roles);

  const menuId = "4C0F3D47-9318-4AED-AB36-A85E78C5CDA8";

  // Fetch role details
  const fetchRoleDetails = async () => {
    try {
      const response = await api.get(`Roles/${roleId}/${menuId}`);
      setRoleName(response.data.roleName);
    } catch (error) {
      toast.error('Failed to fetch role details.');
    }
  };

  useEffect(() => {
    fetchRoleDetails();
  }, [roleId]);

  useEffect(() => {
    if (success) {
      toast.success('Role updated successfully!');
      dispatch(resetStatus());
      navigate('/rolemanagement');
    }

    if (error) {
      toast.error(error);
      dispatch(resetStatus());
    }
  }, [success, error, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roleName) {
      toast.error('Role name is required.');
      return;
    }

    const updatedRole = {
      roleID: roleId,
      roleName,
    };

    dispatch(editRole({ role: updatedRole, roleId, menuId }));
  };

  return (
    <div className="flex">
      <Sidebar activePage="/rolemanagement" />
      <div className="w-4/5 bg-gray-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Role</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Role Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Updating Role...' : 'Update Role'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/rolemanagement')}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRole;
