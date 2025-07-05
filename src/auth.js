export function isDevUser() {
  return import.meta.env.DEV && sessionStorage.getItem("devUser") === "admin";
}

export function isAuthenticated() {
  return isDevUser() || !!sessionStorage.getItem("devUser");
}

export function isAdminUser() {
  return sessionStorage.getItem("devUser") === "admin" || isDevUser();
}

export async function logout(auth) {
  sessionStorage.removeItem("devUser");
  if (auth && auth.currentUser) {
    await import("firebase/auth").then(({ signOut }) => signOut(auth));
  }
  window.location.href = "/login";
}