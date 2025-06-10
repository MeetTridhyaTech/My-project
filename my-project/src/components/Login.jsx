import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import api from "./axiosInstance";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear specific validation error when typing
    setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.password.trim()) errors.password = "Password is required.";
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const response = await api.post(`auth/login`, formData);

      if (response.data.success && response.data.data.token) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("roleName", response.data.data.roleName);
        localStorage.setItem("roleID", response.data.data.roleID);
        localStorage.setItem("permission", JSON.stringify(response.data.data.permissions));
        localStorage.setItem("refreshToken", response.data.data.refreshToken);

        toast.success("Login successful!");

        // Reset form
        setFormData({ email: "", password: "" });
        setValidationErrors({});
        setErrorMessage("");

        // Navigate after short delay
        setTimeout(() => {
          navigate("/userdashboard", { replace: true });
        }, 2000);
      } else {
        setErrorMessage(response.data.message || "Invalid email or password.");
        toast.error(response.data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Invalid Credentials. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
      // toast.error(msg, { duration: 3000 });

    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* React Hot Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        <div className="text-center text-gray-600 mb-6">
          Please sign in to continue
        </div>

        {/* Display server error message */}
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border ${
                validationErrors.email ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all`}
              placeholder="your@email.com"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border ${
                validationErrors.password ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all`}
              placeholder="password"
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
