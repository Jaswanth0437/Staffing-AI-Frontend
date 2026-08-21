const STORAGE_KEY = "hirex_current_user";

// There's no real Azure AD login wired up yet — the "Continue with
// Microsoft" button on the login page is still a UI mock (see
// app/(auth)/login/page.jsx). This captures what real SSO claims would
// otherwise provide (name + email) so the rest of the app — the sidebar
// profile, and critically the "From" address + signature on outreach
// emails — has a real identity to use instead of a hardcoded placeholder.
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
