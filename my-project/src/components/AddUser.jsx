import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "./axiosInstance";
import Sidebar from "./Sidebar";

// Simple Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};

// Toast Component
const Toast = ({ toast, onClose }) => {
  const getToastStyles = (type) => {
    const baseStyles = "fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white font-medium z-50 min-w-80 flex items-center justify-between";
    const typeStyles = {
      success: "bg-green-500",
      error: "bg-red-500", 
      warning: "bg-yellow-500",
      info: "bg-blue-500"
    };
    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  return (
    <div className={getToastStyles(toast.type)}>
      <span>{toast.message}</span>
      <button 
        onClick={() => onClose(toast.id)}
        className="ml-4 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
};

const AddUser = () => {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

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
  const [errors, setErrors] = useState({});
  const menuId = "17DEC13F-8C9F-4287-A918-774375AC1B76";

  // Form validation function
  const validateForm = (data) => {
    const validationErrors = {};
    
    if (!data.firstName.trim()) {
      validationErrors.firstName = "First name is required";
    } else if (data.firstName.trim().length < 2) {
      validationErrors.firstName = "First name must be at least 2 characters";
    }
    
    if (!data.lastName.trim()) {
      validationErrors.lastName = "Last name is required";
    } else if (data.lastName.trim().length < 2) {
      validationErrors.lastName = "Last name must be at least 2 characters";
    }
    
    if (!data.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      validationErrors.email = "Please enter a valid email address";
    }
    
    if (!data.mobile.trim()) {
      validationErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(data.mobile.replace(/\D/g, ''))) {
      validationErrors.mobile = "Mobile number must be 10 digits";
    }
    
    if (!data.password.trim()) {
      validationErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }
    
    if (!data.roleName) {
      validationErrors.roleName = "Role selection is required";
    }
    
    return validationErrors;
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get(`Roles/${menuId}`);
        const roleOptions = response.data.map((role) => ({
          value: role.roleID,
          label: role.roleName, 
        }));
        setRoles(roleOptions);
        showToast("Roles loaded successfully", "success");
      } catch (err) {
        console.log("Error fetching roles", err);
        showToast("Failed to load roles", "error");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (selectedOption) => {
    setFormData({ ...formData, roleName: selectedOption });
    
    // Clear role error when user selects a role
    if (errors.roleName) {
      setErrors(prev => ({ ...prev, roleName: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      showToast(firstError, "warning");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        roleID: formData.roleName?.value,
      };
      console.log("Submitting Data:", requestData);

      await api.post(`User/AddOrUpdate/${menuId}`, requestData);

      showToast("User added successfully! 🎉", "success");
      
      // Reset form and errors
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        password: "",
        roleName: null,
      });
      setErrors({});
      
      // Navigate after showing success message
      setTimeout(() => {
        navigate("/userlist");
      }, 1500);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add user.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: '8px',
      borderColor: errors.roleName ? '#ef4444' : (state.isFocused ? '#10b981' : '#d1d5db'),
      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
      '&:hover': {
        borderColor: errors.roleName ? '#ef4444' : '#10b981'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white',
      color: state.isSelected ? 'white' : '#374151'
    })
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all";
    const errorClass = errors[fieldName] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar activePage="/add-user"/>
      
      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Add New User</h2>
            <p className="text-gray-600">Fill in the details to create a new user account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={getInputClassName('firstName')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={getInputClassName('lastName')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={getInputClassName('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className={getInputClassName('mobile')}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>
            
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={getInputClassName('password')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Role Select */}
            <div>
              <Select
                options={roles}
                value={formData.roleName}
                onChange={handleRoleChange}
                styles={customSelectStyles}
                className="w-full"
                placeholder="Select Role"
                isLoading={roles.length === 0}
                isClearable
              />
              {errors.roleName && (
                <p className="text-red-500 text-sm mt-1">{errors.roleName}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-200 ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding User...
                </div>
              ) : (
                "Add User"
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              className="w-full p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
              onClick={() => navigate("/userlist")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default AddUser;