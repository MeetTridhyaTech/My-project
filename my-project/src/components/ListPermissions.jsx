import { useState, useEffect } from "react";
import api from "./axiosInstance";
import { ShieldCheck, Loader2, Trash2 ,Plus} from "lucide-react";
import Sidebar from "./Sidebar";
import { toast, Toaster } from "react-hot-toast";

const ListPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const response = await api.get("Permissions");
      setPermissions(response.data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to fetch permissions ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this permission?");
    if (!confirmDelete) return;

    toast.loading("Deleting permission...", { id: "deletePermission" });

    try {
      await api.delete(`Permissions/${id}`);
      toast.success("Permission deleted successfully ✅", { id: "deletePermission" });
      fetchPermissions();
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("Failed to delete permission ❌", { id: "deletePermission" });
    }
  };

//   const handleEdit = (id) => {
//     toast("Edit permission functionality to be implemented ✏️",
//      {
//       icon: "⚠️",
//       style: {
//         borderRadius: "10px",
//         background: "#333",
//         color: "#fff",
//       },
//     });
//   };

  useEffect(() => {
    fetchPermissions();
  }, []);

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
      <button
        onClick={() => navigate("/addpermission")}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-md shadow-md transition-transform duration-300 hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        <span>Add Permission</span>
      </button>
        </div>

        {/* Table or Content */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
          ) : permissions.length === 0 ? (
            <p className="text-center text-gray-500 py-20 text-lg font-medium animate-fade-in">
              🚫 No permissions found.
            </p>
          ) : (
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-bold tracking-wider">
                  <th className="py-4 px-6 border-b border-blue-300">Id</th>
                  <th className="py-4 px-6 border-b border-blue-300">Permission Name</th>
                  <th className="py-4 px-6 border-b border-blue-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, index) => (
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
                        <button
                          onClick={() => handleDelete(perm.id)}
                          className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-800 transition-all duration-300 ease-in-out group-hover:scale-105"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  </div>
);

};

export default ListPermissions;
