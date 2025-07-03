import { User } from "@/types/types";
import { API_URL } from "@/config/config";

export const fetchEmployees = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users/employees`, {
      method: "GET",
      credentials: "include", // Para enviar las cookies de autenticación
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener empleados");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};
