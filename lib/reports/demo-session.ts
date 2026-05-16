export function getDemoSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const key = "supportnote_demo_session_id";
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(key, nextId);
  return nextId;
}
