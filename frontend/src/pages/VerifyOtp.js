import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const verifyOtp = async () => {
    try {
      await api.post("/verifyOtp", {
        email: state.email,
        otp
      });
      alert("OTP verified successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  const resendOtp = async () => {
    try {
      await api.post("/resendOtp", {
        email: state.email,
        mobile: state.mobile
      });
      alert("OTP resent");
    } catch (err) {
      alert(err.response?.data?.message || "Resend failed");
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>

      <input
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
      />

      <button onClick={verifyOtp}>Verify</button>
      <button onClick={resendOtp}>Resend OTP</button>
    </div>
  );
}
