// import { useLocation, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { toast, Toaster } from "react-hot-toast";
// import api from "../axiosInstance"; 

// function ResetPassword() {
//   const location = useLocation();
//   const emailFromLocation = location.state?.email || "";
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: emailFromLocation,
//     otp: "",
//     newPassword: "",
//   });

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleResetPassword = async () => {
//     const { email, otp, newPassword } = formData;

//     if (!email || !otp || !newPassword) {
//       toast.error("All fields are required");
//       return;
//     }

//     try {
//       await api.post("auth/reset-password", formData);
//       toast.success("Password reset successful");
//       setTimeout(() => navigate("/login"), 1000);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to reset password");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <Toaster />
//       <div className="bg-white shadow-md rounded-lg p-6 w-96">
//         <h2 className="text-xl font-bold mb-4">Reset Password</h2>

//         <input
//           type="email"
//           name="email"
//           className="w-full p-3 border border-gray-300 rounded mb-3"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           name="otp"
//           className="w-full p-3 border border-gray-300 rounded mb-3"
//           placeholder="OTP"
//           value={formData.otp}
//           onChange={handleChange}
//         />
//         <input
//           type="password"
//           name="newPassword"
//           className="w-full p-3 border border-gray-300 rounded mb-4"
//           placeholder="New Password"
//           value={formData.newPassword}
//           onChange={handleChange}
//         />
//         <button
//           className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
//           onClick={handleResetPassword}
//         >
//           Reset Password
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ResetPassword;



import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "../axiosInstance";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
const verifiedEmail = localStorage.getItem("resetEmail") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleResetPassword = async () => {
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      showToast("Both password fields are required", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/auth/reset-password/${verifiedEmail}`, {
  newPassword,
        confirmPassword,

});

      if (response.status === 200) {
        showToast("Password reset successful", "success");
              localStorage.removeItem("resetEmail");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false }), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {toast.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-sm text-gray-600">
            Set your new password to complete the reset process
          </p>
        </div>

        <div className="space-y-5">
          {/* New Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-800"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Strength Bar */}
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  formData.newPassword.length >= i * 2
                    ? formData.newPassword.length >= 8
                      ? "bg-green-500"
                      : formData.newPassword.length >= 6
                      ? "bg-yellow-500"
                      : "bg-red-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

