import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup(form);
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
        <h1 className="mb-6 text-xl font-semibold text-slate-800 sm:text-2xl">
          Create an account
        </h1>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="mb-4 block text-sm font-medium text-slate-700">
          Username
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            required
            minLength={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500"
          />
        </label>
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
            minLength={6}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-800 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-slate-800 underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
