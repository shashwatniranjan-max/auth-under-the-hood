import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    getMe(token)
      .then((data) => setUser(data.user))
      .catch((err) => {
        setError(err.message);
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (!user && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-semibold text-slate-800">
          Welcome, {user?.username}
        </h1>
        <p className="mb-6 text-slate-600">{user?.email}</p>
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-md bg-slate-800 py-2 font-medium text-white hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
