import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import api from "./axiosInstance";
import GlobalLoader from "./GlobalLoader";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.password.trim()) errors.password = "Password is required.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(`auth/login`, formData);

      if (response.data.success && response.data.data.token) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("userId", response.data.data.id);
        localStorage.setItem("roleName", response.data.data.roleName);
        localStorage.setItem("roleID", response.data.data.roleID);
        localStorage.setItem("permission", JSON.stringify(response.data.data.permissions));
        localStorage.setItem("refreshToken", response.data.data.refreshToken);

        toast.success("Login successful!");

        setFormData({ email: "", password: "" });
        setValidationErrors({});
        setErrorMessage("");

        setTimeout(() => {
          setLoading(false);
          navigate("/userdashboard", { replace: true });
        }, 500);
      } else {
        setLoading(false);
        const msg = response.data.message || "Invalid email or password.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (error) {
      setLoading(false);
      console.error("Login Error:", error);

      let msg = "Something went wrong. Please try again.";
      if (error.response) {
        // Backend responded with an error
        msg = error.response.data?.message || "Invalid email or password.";
      } else if (error.request) {
        // Request made, no response received
        msg = "Unable to connect to the server. Please check your network.";
      }

      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        <div className="text-center text-gray-600 mb-6">
          Please sign in to continue
        </div>

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
              className={`w-full p-3 border ${validationErrors.email ? "border-red-500" : "border-gray-300"
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
              className={`w-full p-3 border ${validationErrors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all`}
              placeholder="password"
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <p className="text-right text-sm mt-1">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </p>

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
