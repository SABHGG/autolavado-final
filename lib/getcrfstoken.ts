export function getCsrfToken() {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_access_token="));
  return match?.split("=")[1];
}
