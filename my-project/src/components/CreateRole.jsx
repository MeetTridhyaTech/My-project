// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from './axiosInstance';
// import { toast } from 'react-hot-toast';
// import Sidebar from './Sidebar';

// const CreateRole = () => {
//   const navigate = useNavigate();
//   const [roleName, setRoleName] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Function to generate a GUID
//   const generateGuid = () => {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//       var r = (Math.random() * 16) | 0,
//         v = c === 'x' ? r : (r & 0x3) | 0x8;
//       return v.toString(16);
//     });
//   };

//     const menuId = "4C0F3D47-9318-4AED-AB36-A85E78C5CDA8";      

//   // Handle form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!roleName) {
//       toast.error('Role name is required.', {
//         duration: 3000,
//         style: {
//           background: '#f8d7da',
//           border: '1px solid #f5c2c7',
//           padding: '16px',
//           color: '#842029',
//         },
//       });
//       return;
//     }

//     const newRole = {
//       roleID: generateGuid(),
//       roleName: roleName,
//     };

//     setLoading(true);
//     try {
//       await api.post(`Roles/${menuId}`, newRole);
//       toast.success('Role created successfully!', {
//         icon: '✅',
//         duration: 3000,
//         style: {
//           background: '#d1e7dd',
//           border: '1px solid #badbcc',
//           padding: '16px',
//           color: '#0f5132',
//         },
//       });
//       navigate('/rolemanagement');
//     } catch (error) {
//       console.error('Error creating role:', error);
//       toast.error('Failed to create role.', {
//         icon: '❌',
//         duration: 3000,
//         style: {
//           background: '#f8d7da',
//           border: '1px solid #f5c2c7',
//           padding: '16px',
//           color: '#842029',
//         },
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Sidebar */}
//       <Sidebar activePage="/rolemanagement" />

//       {/* Main Content */}
//       <div className="w-4/5 bg-gray-50 min-h-screen p-6">
//         <div className="max-w-6xl mx-auto">
//           <div className="bg-white shadow-lg rounded-2xl p-6">
//             <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Role</h2>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-6">
//                 <label className="block text-gray-700 font-semibold mb-2">Role Name</label>
//                 <input
//                   type="text"
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
//                   value={roleName}
//                   onChange={(e) => setRoleName(e.target.value)}
//                   placeholder="Enter role name"
//                   required
//                 />
//               </div>

//               <div className="flex gap-4 mt-8">
//                 <button
//                   type="submit"
//                   className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition duration-200 ${loading && 'opacity-50 cursor-not-allowed'}`}
//                   disabled={loading}
//                 >
//                   {loading ? 'Creating Role...' : 'Create Role'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => navigate('/rolemanagement')}
//                   className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition duration-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateRole;

// CreateRole.jsx (Updated to use Redux Toolkit)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { createRole, resetStatus } from '../../features/Roles/RoleSlice';
// import { createRole, resetStatus } from '../features/roles/roleSlice'; // ✅ Corrected import

const CreateRole = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [roleName, setRoleName] = useState('');
  const { loading, success, error } = useSelector((state) => state.roles);

  const menuId = '4C0F3D47-9318-4AED-AB36-A85E78C5CDA8';

  const generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roleName) {
      toast.error('Role name is required');
      return;
    }

    const newRole = {
      roleID: generateGuid(),
      roleName: roleName,
    };

    dispatch(createRole({ role: newRole, menuId }));
  };

  useEffect(() => {
    if (success) {
      toast.success('Role created successfully!');
      dispatch(resetStatus());
      navigate('/rolemanagement');
    }
    if (error) {
      toast.error(error);
      dispatch(resetStatus());
    }
  }, [success, error, dispatch, navigate]);

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/rolemanagement" />
      <div className="w-4/5 bg-gray-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Role</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Role Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition duration-200 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Creating Role...' : 'Create Role'}
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

export default CreateRole;
