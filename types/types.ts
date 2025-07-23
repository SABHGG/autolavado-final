// Usuario
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: "admin" | "employee" | "client";
  created_at?: string;
  updated_at?: string;
}

// Datos para registro de usuario
export interface UserRegister {
  username: string;
  email: string;
  phone: string;
  password: string;
}

// Datos para actualización de usuario
export interface UserUpdate {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "admin" | "employee" | "client";
}

// Vehículo
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  vehicle_type: "motocicleta" | "coche" | "camion" | "autobus" | "furgoneta";
  owner_id: string;
  updated_at: string;
  created_at: string;
}

// Servicio
export interface Service {
  id: number;
  name: string;
  price: number;
  description: string;
  duration: number;
  is_active: boolean;
}

// Cita (Appointment)
export interface AppointmentService {
  service_id: string;
  service_name?: string;
  service_price?: number;
  service_description?: string;
  duration?: number;
  employee_id?: string;
}

export interface Appointment {
  id: string;
  appointment_time: string;
  status: "pendiente" | "en_progreso" | "completada" | "cancelada";
  user_id: string;
  vehicle_id: string;
  services: AppointmentService[];
  created_at: string;
  updated_at: string;
}

// Reporte de ventas
export interface SalesReport {
  total_sales: number;
  total_appointments: number;
  start_date: string;
  end_date: string;
  details: Array<{
    date: string;
    sales: number;
    appointments: number;
  }>;
}

// Respuesta de login
export interface LoginResponse {
  login: boolean;
  user: User;
}

// Respuesta genérica de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
