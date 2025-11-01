// Simple authentication helper
// In production, this would integrate with your backend auth system

export const isAuthenticated = (): boolean => {
  // Check if user is authenticated (e.g., token in localStorage)
  const token = localStorage.getItem("auth_token");
  return !!token;
};

export const login = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const logout = () => {
  localStorage.removeItem("auth_token");
};

