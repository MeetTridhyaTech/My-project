import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; 
import api from "./axiosInstance";

const AddUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    roleName: null,
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const menuId = "17DEC13F-8C9F-4287-A918-774375AC1B76";

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get(`Roles/${menuId}`);
        const roleOptions = response.data.map((role) => ({
          value: role.roleID,
          label: role.roleName, 
        }));
        setRoles(roleOptions);
      } catch (err) {
        console.log("Error fetching roles", err);
        setError("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption) => {
    setFormData({ ...formData, roleName: selectedOption });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        roleID: formData.roleName?.value,
      };
      console.log("Submitting Data:", requestData);

      await api.post(`User/AddOrUpdate/${menuId}`, requestData);

      alert("User added successfully!");
      navigate("/userlist");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Add New User
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:ring focus:ring-green-300"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:ring focus:ring-green-300"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:ring focus:ring-green-300"
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:ring focus:ring-green-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md focus:ring focus:ring-green-300"
          />

          {/* React Select Dropdown */}
          <Select
            options={roles}
            value={formData.roleName}
            onChange={handleRoleChange}
            className="w-full"
            placeholder="Select Role"
            isLoading={roles.length === 0}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-md text-white font-semibold transition ${
              loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>

        <button
          className="w-full mt-4 p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
          onClick={() => navigate("/userlist")}
          placeholder="Select a Role"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddUser;
