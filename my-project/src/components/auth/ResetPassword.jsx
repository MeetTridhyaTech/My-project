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
import { Mail, Shield, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";

function ResetPassword() {
  // Mock location state - replace with actual useLocation hook
  const emailFromLocation = "";
  
  const [formData, setFormData] = useState({
    email: emailFromLocation,
    otp: "",
    newPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: '' });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleResetPassword = async () => {
    const { email, otp, newPassword } = formData;

    if (!email || !otp || !newPassword) {
      setShowToast({ show: true, message: "All fields are required", type: "error" });
      setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowToast({ show: true, message: "Password reset successful", type: "success" });
      setTimeout(() => {
        setShowToast({ show: false, message: '', type: '' });
        // navigate("/login");
        console.log("Navigate to login");
      }, 1000);
    } catch (error) {
      setShowToast({ show: true, message: "Failed to reset password", type: "error" });
      setTimeout(() => setShowToast({ show: false, message: '', type: '' }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    console.log("Navigate back");
    // navigate(-1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Toast notification */}
      {showToast.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 ${
          showToast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {showToast.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {showToast.message}
        </div>
      )}
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        {/* <button 
          onClick={handleBack}
          className="absolute -top-16 left-0 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">Back</span>
        </button> */}

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20">
          {/* Icon and header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-600 text-sm">
              Enter the OTP sent to your email and create a new secure password.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-500"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* OTP field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="otp"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-500 text-center tracking-widest font-mono text-lg"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                maxLength="6"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-500"
                placeholder="New password"
                value={formData.newPassword}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                )}
              </button>
            </div>

            {/* Password strength indicator */}
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      formData.newPassword.length >= i * 2
                        ? formData.newPassword.length >= 8
                          ? 'bg-green-500'
                          : formData.newPassword.length >= 6
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Password strength: {formData.newPassword.length >= 8 ? 'Strong' : formData.newPassword.length >= 6 ? 'Medium' : formData.newPassword.length >= 3 ? 'Weak' : 'Enter password'}
              </p>
            </div>

            <button
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl'
              }`}
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          {/* Footer */}
          {/* <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the OTP?{' '}
              <button 
                onClick={() => console.log("Resend OTP")}
                className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors duration-200"
              >
                Resend OTP
              </button>
            </p>
          </div> */}
        </div>

        {/* Security tips */}
        {/* <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            Security Tips
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use at least 8 characters with mixed case, numbers, and symbols</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}

export default ResetPassword;