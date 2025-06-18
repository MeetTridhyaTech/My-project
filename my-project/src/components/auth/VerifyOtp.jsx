import { useState } from "react";
import { Shield, CheckCircle } from "lucide-react";
import api from "../axiosInstance";
import { useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!otp) {
      showToast("OTP is required", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(`auth/verify-otp`, { otp });

      showToast(res.data.message, "success");

      setTimeout(() => {
        setToast({ show: false });
        navigate("/reset-password", { state: { otp, email: location.state?.email } });
      }, 1500);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Invalid OTP or OTP expired",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 p-4">
      {toast.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-md flex items-center gap-2 z-50 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Verify OTP</h2>
          <p className="text-gray-600 text-sm text-center mt-1">
            Enter the OTP sent to your email
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 tracking-widest text-center font-mono"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
