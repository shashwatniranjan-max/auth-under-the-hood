const API_BASE = (
  import.meta.env.VITE_API_URL || "https://auth-under-the-hood.onrender.com"
).replace(/\/$/, "");

const API_URL = `${API_BASE}/api/auth`;
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 5;
const TIMEOUT_MS = 20000;

export function wakeApi() {
  return fetch(`${API_BASE}/api/health`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null);
}

export async function signup({ username, email, password }) {
  return request("/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login({ email, password }) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token) {
  return request("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getUsers(token) {
  return request("/users", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateCredentials(token, { email, password }) {
  return request("/update", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, password }),
  });
}

export async function deleteAccount(token, { password }) {
  return request("/delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableNetworkError(err) {
  return (
    err?.name === "AbortError" ||
    err?.name === "TypeError" ||
    err?.message === "Failed to fetch"
  );
}

async function request(path, options = {}) {
  const { headers, body, ...rest } = options;
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...rest,
        body,
        signal: controller.signal,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(headers || {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return data;
      }

      if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_ATTEMPTS) {
        await sleep(Math.min(1000 * 2 ** (attempt - 1), 8000));
        continue;
      }

      throw new Error(data.message || "Request failed");
    } catch (err) {
      lastError = err;
      if (isRetryableNetworkError(err) && attempt < MAX_ATTEMPTS) {
        await sleep(Math.min(1000 * 2 ** (attempt - 1), 8000));
        continue;
      }
      if (err?.name === "AbortError") {
        throw new Error("Server took too long to respond. Please try again.");
      }
      throw err instanceof Error ? err : new Error("Request failed");
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("Request failed");
}
