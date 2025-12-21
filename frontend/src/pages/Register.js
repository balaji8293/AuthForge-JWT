import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: ""
  });

  const navigate = useNavigate();

  const submit = async () => {
    try {
      await api.post("/register", form);
      navigate("/verify-otp", {
        state: { email: form.email, mobile: form.mobile }
      });
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Mobile (+91XXXXXXXXXX)"
        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={submit}>Register</button>
    </div>
  );
}
