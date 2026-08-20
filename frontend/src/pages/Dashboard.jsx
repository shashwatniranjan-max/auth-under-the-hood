import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAccount, getMe, getUsers, updateCredentials } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    getMe(token)
      .then((meData) => {
        setUser(meData.user);
        setForm({ email: meData.user.email, password: "" });
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

    getUsers(token)
      .then((usersData) => {
        setUsers(usersData.users);
      })
      .catch((err) => {
        setError(err.message || "Could not load users");
      })
      .finally(() => {
        setUsersLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function openPanel(nextPanel) {
    setMenuOpen(false);
    setPanel(nextPanel);
    setUpdateError("");
    setUpdateSuccess("");
    setDeleteError("");
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
      setUpdateSuccess(
        "Credentials updated. The table now shows the new email and bcrypt hash."
      );
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(e) {
    e.preventDefault();
    setDeleteError("");

    if (
      !window.confirm(
        "Delete your account permanently? This cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    const token = localStorage.getItem("token");
    try {
      await deleteAccount(token, { password: deletePassword });
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 text-slate-600">
        Loading your account...
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-slate-100 px-3 py-6 sm:px-4 sm:py-10">
      <div ref={menuRef} className="absolute top-3 left-3 z-30 sm:top-4 sm:left-4">
        <button
          type="button"
          aria-label="Account options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-3.5 rounded bg-slate-700" />
            <span className="block h-0.5 w-3.5 rounded bg-slate-700" />
            <span className="block h-0.5 w-3.5 rounded bg-slate-700" />
          </span>
        </button>
        {menuOpen && (
          <div className="absolute top-11 left-0 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => openPanel("update")}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Update credentials
            </button>
            <button
              type="button"
              onClick={() => openPanel("delete")}
              className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            >
              Delete account
            </button>
          </div>
        )}
      </div>

      {panel && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-3 py-16 sm:items-center"
          onClick={() => setPanel(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            {panel === "update" && (
              <form onSubmit={onUpdate}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Update credentials
                  </h2>
                  <button
                    type="button"
                    onClick={() => setPanel(null)}
                    className="text-sm text-slate-500 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>
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
                  className="w-full rounded-md bg-slate-800 px-4 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Update credentials"}
                </button>
              </form>
            )}

            {panel === "delete" && (
              <form onSubmit={onDelete}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-red-800">
                    Delete account
                  </h2>
                  <button
                    type="button"
                    onClick={() => setPanel(null)}
                    className="text-sm text-slate-500 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  Enter your current password to permanently remove your record
                  from MongoDB.
                </p>
                {deleteError && (
                  <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {deleteError}
                  </p>
                )}
                <label className="mb-6 block text-sm font-medium text-slate-700">
                  Password
                  <input
                    name="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-red-400"
                  />
                </label>
                <button
                  type="submit"
                  disabled={deleting}
                  className="w-full rounded-md bg-red-700 px-4 py-2.5 font-medium text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete my account"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl space-y-4 pt-8 sm:space-y-6 sm:pt-4">
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
              Passwords are bcrypt hashes, matching the values saved in the
              database.
            </p>
            {error && (
              <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {usersLoading && (
              <p className="text-sm text-slate-500">Loading users...</p>
            )}
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
                  <p className="mb-2 break-all text-sm text-slate-700">
                    {row.email}
                  </p>
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
                {usersLoading && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-6 text-sm text-slate-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                )}
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
      </div>
    </div>
  );
}
