// This is a wrapper around the native fetch API
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  // Add the Authorization header to the request
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  // Check for auth errors
  if (response.status === 401 || response.status === 403) {
    // Clear the token and redirect to the login page
    localStorage.removeItem("token");

    // Use a custom event to notify the app to show a toast
    window.dispatchEvent(new CustomEvent("auth-error"));

    // Redirect to login page
    window.location.href = "/login";

    // Throw an error to stop the current execution
    throw new Error("Session expired. Please log in again.");
  }

  return response;
};
