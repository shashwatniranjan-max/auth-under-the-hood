import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, getUsers, updateCredentials } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    Promise.all([getMe(token), getUsers(token)])
      .then(([meData, usersData]) => {
        setUser(meData.user);
        setUsers(usersData.users);
        setForm({ email: meData.user.email, password: "" });
      })
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

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onUpdate(e) {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");
    setSaving(true);

    const token = localStorage.getItem("token");
    try {
      const data = await updateCredentials(token, form);
      setUser(data.user);
      setForm({ email: data.user.email, password: "" });
      const usersData = await getUsers(token);
      setUsers(usersData.users);
      setUpdateSuccess("Credentials updated. The table now shows the new email and bcrypt hash.");
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user && !error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-100 px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold break-words text-slate-800 sm:text-2xl">
              Welcome, {user?.username}
            </h1>
            <p className="break-all text-slate-600">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full shrink-0 rounded-md bg-slate-800 px-4 py-2.5 font-medium text-white hover:bg-slate-700 sm:w-auto"
          >
            Logout
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Users stored in MongoDB
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Passwords are bcrypt hashes, matching the values saved in the database.
            </p>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {users.map((row) => {
              const isActive = String(row.id) === String(user?.id);
              return (
                <article
                  key={row.id}
                  className={`rounded-lg border p-3 ${
                    isActive
                      ? "border-sky-200 bg-sky-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="font-medium break-words text-slate-800">
                      {row.username}
                    </p>
                    {isActive && (
                      <span className="rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Email
                  </p>
                  <p className="mb-2 break-all text-sm text-slate-700">{row.email}</p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Hashed Password
                  </p>
                  <p className="font-mono text-xs break-all text-slate-600">
                    {row.password}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Username</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Hashed Password</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => {
                  const isActive = String(row.id) === String(user?.id);
                  return (
                    <tr
                      key={row.id}
                      className={
                        isActive
                          ? "bg-sky-50"
                          : "border-t border-slate-100 bg-white"
                      }
                    >
                      <td className="px-6 py-3 font-medium text-slate-800">
                        <span className="flex items-center gap-2">
                          {row.username}
                          {isActive && (
                            <span className="rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
                              You
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3 break-all text-slate-700">
                        {row.email}
                      </td>
                      <td className="max-w-md px-6 py-3 font-mono text-xs break-all text-slate-600">
                        {row.password}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={onUpdate}
          className="rounded-xl bg-white p-4 shadow-md sm:p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Edit Credentials
          </h2>
          {updateError && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {updateError}
            </p>
          )}
          {updateSuccess && (
            <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              {updateSuccess}
            </p>
          )}
          <label className="mb-4 block text-sm font-medium text-slate-700">
            New email
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
            New password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-slate-500"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-slate-800 px-4 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Saving..." : "Update credentials"}
          </button>
        </form>
      </div>
    </div>
  );
}
