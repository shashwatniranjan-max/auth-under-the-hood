import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), 2500);
    return () => clearTimeout(timer);
  }, [loading]);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-md sm:p-8"
      >
        <h1 className="mb-6 text-xl font-semibold text-slate-800 sm:text-2xl">Log in</h1>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="mb-4 block text-sm font-medium text-slate-700">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500"
          />
        </label>
        <label className="mb-6 block text-sm font-medium text-slate-700">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-800 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading
            ? slow
              ? "Starting server..."
              : "Logging in..."
            : "Log in"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link to="/signup" className="font-medium text-slate-800 underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
