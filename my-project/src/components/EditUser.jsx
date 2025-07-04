import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById, updateUser, clearMessages } from "../../features/Users/UserSlice";
import api from "./axiosInstance";
import Sidebar from './Sidebar';

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user, loading, error, successMessage } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    roleName: ""
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await api.get("Roles/17DEC13F-8C9F-4287-A918-774375AC1B76");
      const roleOptions = res.data.map(role => ({
        value: role.roleID,
        label: role.roleName
      }));
      setRoles(roleOptions);
    };

    fetchRoles();
    dispatch(fetchUserById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        password: user.password || "",
        roleName: roles.find((r) => r.value === user.roleID) || null
      });
    }
  }, [user, roles]);

  useEffect(() => {
    if (successMessage) {
      alert(successMessage);
      navigate("/userlist");
      dispatch(clearMessages());
    }
  }, [successMessage, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption) => {
    setFormData({ ...formData, roleName: selectedOption });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUser({ id, formData }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePage="/userlist" />
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Edit User</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {["firstName", "lastName", "email", "mobile", "password"].map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required={field !== "password"}
              />
            ))}
            <Select
              options={roles}
              value={formData.roleName}
              onChange={handleRoleChange}
              placeholder="Select Role"
              isClearable
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-md text-white font-semibold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Updating..." : "Update User"}
            </button>
          </form>
          <button
            className="w-full mt-4 p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            onClick={() => navigate("/userlist")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;