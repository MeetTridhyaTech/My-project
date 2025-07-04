import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addPermission, resetStatus } from "../../features/Permissions/permissionSlice";
import { toast, Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";

const AddPermission = () => {
    const [permissionName, setPermissionName] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loading, success, error } = useSelector((state) => state.permissions);

    const menuId = "6223D2F6-C7D5-4BCE-A300-FF39FFD46B11";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!permissionName.trim()) {
            toast.error("Permission name cannot be empty ❌");
            return;
        }

        dispatch(addPermission({ name: permissionName, menuId }));
    };

    useEffect(() => {
        if (loading) {
            toast.loading("Adding permission...", { id: "addPermission" });
        } else if (success) {
            toast.success("Permission added successfully ✅", { id: "addPermission" });
            dispatch(resetStatus());
            setPermissionName("");
            navigate("/list-permissions");
        } else if (error) {
            toast.error(error || "Failed to add permission ❌", { id: "addPermission" });
            dispatch(resetStatus());
        }
    }, [loading, success, error, dispatch, navigate]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activePage="/add-permission" />
            <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-white">
                <Toaster position="top-right" />
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Add New Permission
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="permissionName" className="block text-lg font-medium text-gray-700">
                                Permission Name
                            </label>
                            <input
                                id="permissionName"
                                type="text"
                                value={permissionName}
                                onChange={(e) => setPermissionName(e.target.value)}
                                placeholder="Enter permission name"
                                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-between space-x-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                                disabled={loading}
                            >
                                {loading ? "Adding..." : "Add Permission"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/list-permissions")}
                                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400 transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPermission;
