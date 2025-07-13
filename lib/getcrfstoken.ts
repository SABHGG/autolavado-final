export function getCsrfToken() {
  const csrfMatch = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrf_access_token="));

  return csrfMatch ? csrfMatch.split("=")[1] : null;
}
