import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axiosInstance";
import { toast, Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar"; // Import Sidebar component

const AddPermission = () => {
    const [permissionName, setPermissionName] = useState("");
    const navigate = useNavigate();
    // const [userPermissions, setUserPermissions] = useState([]);

    // const canAdd = userPermissions.includes("AddUser");

    //     useEffect(() => {
    //   const storedPermissions = JSON.parse(localStorage.getItem(`permission`)) || [];
    //   setUserPermissions(storedPermissions);
    // }, []);

    const menuId = "6223D2F6-C7D5-4BCE-A300-FF39FFD46B11";      


    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!permissionName.trim()) {
            toast.error("Permission name cannot be empty ❌");
            return;
        }

        try {
            toast.loading("Adding permission...", { id: "addPermission" });

            await api.post(`Permissions/Add/${menuId}`, {
                name: permissionName,
            });

            toast.success("Permission added successfully ✅", { id: "addPermission" });
            setPermissionName("");
            navigate("/list-permissions");
        } catch (error) {
            toast.error("Failed to add permission ❌", { id: "addPermission" });
            console.error("Error adding permission:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar activePage="/add-permission" />

            {/* Main content area */}
            <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-white">
                <Toaster position="top-right" />

                {/* Form container */}
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        Add New Permission
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-lg font-medium text-gray-700" htmlFor="permissionName">
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
                            {/* {(canAdd && */}
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                Add Permission
                            </button>
                            {/* )} */}
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
