import { useEffect, useState } from "react";
import { API_URL } from "@/config/config";

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/users/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  return user;
}
