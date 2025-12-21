import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/profile")
      .then((res) => setUser(res.data))
      .catch(() => {
        alert("Unauthorized");
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
