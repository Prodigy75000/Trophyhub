// src/api/client.ts
import { PROXY_BASE_URL } from "../../config/endpoints";

// --- STATE ---
let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onTokenUpdate: ((a: string, r: string) => void) | null = null;
let _onLogout: (() => void) | null = null;

// Lock to prevent multiple refresh calls at once
let _isRefreshing = false;
let _refreshPromise: Promise<string> | null = null;

// --- INITIALIZATION ---
// Call this from TrophyContext to give the client its "Brain"
export const setupApiClient = (
  accessToken: string | null,
  refreshToken: string | null,
  onTokenUpdate: (a: string, r: string) => void,
  onLogout: () => void
) => {
  _accessToken = accessToken;
  _refreshToken = refreshToken;
  _onTokenUpdate = onTokenUpdate;
  _onLogout = onLogout;
};

// --- THE SMART FETCHER ---
export const clientFetch = async (endpoint: string, options: RequestInit = {}) => {
  // 1. Build URL (Handle both relative and absolute)
  const url = endpoint.startsWith("http") ? endpoint : `${PROXY_BASE_URL}${endpoint}`;

  // 2. Attach Auth Header
  const headers = new Headers(options.headers);
  if (_accessToken) {
    headers.set("Authorization", `Bearer ${_accessToken}`);
  }

  // 3. Helper to make the actual call
  const doRequest = async (tokenOverride?: string) => {
    if (tokenOverride) headers.set("Authorization", `Bearer ${tokenOverride}`);
    return fetch(url, { ...options, headers });
  };

  let response = await doRequest();

  // 4. INTERCEPTOR: Handle 401 (Expired Token)
  if (response.status === 401 && _refreshToken) {
    console.log("🔄 [API] 401 Detected! Initiating Silent Refresh...");

    try {
      if (!_isRefreshing) {
        _isRefreshing = true;

        // Create a promise so other parallel requests wait for this one
        _refreshPromise = (async () => {
          const res = await fetch(`${PROXY_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: _refreshToken }),
          });

          if (!res.ok) throw new Error("Refresh failed on server");

          const data = await res.json();
          // Update local state
          _accessToken = data.accessToken;
          _refreshToken = data.refreshToken; // PSN rotates refresh tokens too!

          // Persist state in React/Storage
          if (_onTokenUpdate) _onTokenUpdate(data.accessToken, data.refreshToken);

          return data.accessToken;
        })();
      }

      // Wait for the refresh to finish (whether we started it or someone else did)
      const newAccessToken = await _refreshPromise;

      console.log("✅ [API] Refresh Successful. Retrying original request.");

      // Cleanup
      _isRefreshing = false;
      _refreshPromise = null;

      // 5. RETRY ORIGINAL REQUEST
      response = await doRequest(newAccessToken || undefined);
    } catch (e) {
      console.warn("❌ [API] Session died. Logging out.", e);
      _isRefreshing = false;
      _refreshPromise = null;
      if (_onLogout) _onLogout();
      // Don't throw, just return the 401 so the UI can show a proper error state if needed
      return response;
    }
  }

  return response;
};
