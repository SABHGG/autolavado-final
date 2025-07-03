"use client"
import * as React from "react"
import { useUser } from "@/hooks/useUser"
import {
  Car,
  CalendarCheck,
  Wrench,
  Users,
  BarChart2,
  WashingMachine,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

type User = {
  username?: string
  email?: string
  role?: string
}


const navClient = [
  {
    title: "Vehículos",
    url: "",
    icon: Car,
    items: [
      { title: "Mis Vehículos", url: "/dashboard/vehicles" },
      { title: "Registrar Vehículo", url: "/dashboard/vehicles/new" },
    ],
  },
  {
    title: "Citas",
    url: "",
    icon: CalendarCheck,
    items: [
      { title: "Mis Citas", url: "/dashboard/appointments" },
      { title: "Solicitar Cita", url: "/dashboard/appointments/new" },
    ],
  },
];

// Navegación para empleados
const navEmployee = [
  {
    title: "Citas",
    url: "",
    icon: CalendarCheck,
    items: [
      { title: "Citas Asignadas", url: "/dashboard/appointments/assigned" },
      { title: "Todas las Citas", url: "/dashboard/appointments" },
    ],
  },
  {
    title: "Servicios",
    url: "/dashboard/services",
    icon: Wrench,
  },
];

// Navegación para administradores
const navAdmin = [
  {
    title: "Usuarios",
    url: "",
    icon: Users,
    items: [
      { title: "Lista de Usuarios", url: "/dashboard/users" },
      { title: "Registrar Usuario", url: "/dashboard/users/new" },
    ],
  },
  {
    title: "Vehículos",
    url: "/dashboard/vehicles",
    icon: Car,
    items: [
      { title: "Todos los Vehículos", url: "/dashboard/vehicles" },
      { title: "Registrar Vehículo", url: "/dashboard/vehicles/new" },
    ],
  },
  {
    title: "Citas",
    url: "/dashboard/appointments",
    icon: CalendarCheck,
    items: [
      { title: "Todas las Citas", url: "/dashboard/appointments" },
      { title: "Citas Asignadas", url: "/dashboard/appointments/assigned" },
    ],
  },
  {
    title: "Servicios",
    url: "",
    icon: Wrench,
    items: [
      { title: "Ver Servicios", url: "/dashboard/services" },
      { title: "Agregar Servicio", url: "/dashboard/services/new" },
    ],
  },
  {
    title: "Reportes",
    url: "",
    icon: BarChart2,
    items: [
      { title: "Ventas", url: "/dashboard/reports/sales" },
    ],
  },
];



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUser() as User | null | undefined

  const data = {
    user: {
      name: user?.username ?? "",
      email: user?.email ?? "",
      avatar: "https://api.dicebear.com/9.x/lorelei/svg",
    },
    teams: [
      {
        name: "Autolavado La 44",
        logo: WashingMachine,
        plan: "Enterprise",
      }
    ],
    navMain: user?.role === "admin" ? navAdmin : user?.role === "employee" ? navEmployee : navClient,
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
