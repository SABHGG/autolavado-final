// components/new-appointment-form.tsx
"use client"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { IconCalendar, IconCar, IconUser, IconLoader } from "@tabler/icons-react"
import { API_URL } from "@/config/config"
import { getCsrfToken } from "@/lib/getcrfstoken"

const formSchema = z.object({
    appointment_time: z.date({
        required_error: "La fecha y hora son requeridas",
    }),
    user_id: z.string().min(1, "Usuario es requerido"),
    vehicle_id: z.string().min(1, "Vehículo es requerido"),
    services: z.array(z.string()).min(1, "Al menos un servicio es requerido"),
})

interface Service {
    id: string
    name: string
    price: number
    duration: number
}

interface User {
    id: string
    name: string
    email: string
}

interface Vehicle {
    id: string
    plate: string
    brand: string
    model: string
}

export function NewAppointmentForm({
    onSuccess,
    onCancel,
}: {
    onSuccess: () => void
    onCancel: () => void
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            appointment_time: new Date(),
            user_id: "",
            vehicle_id: "",
            services: [],
        },
    })

    // Fetch services
    const [services, setServices] = useState<Service[]>([])
    const [loadingServices, setLoadingServices] = useState(true)
    useEffect(() => {
        setLoadingServices(true)
        fetch(`${API_URL}/services/`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("Error al cargar servicios")
                return res.json()
            })
            .then(setServices)
            .catch(() => setServices([]))
            .finally(() => setLoadingServices(false))
    }, [])

    // Fetch users
    const [users, setUsers] = useState<User[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    useEffect(() => {
        setLoadingUsers(true)
        fetch(`${API_URL}/users/`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("Error al cargar usuarios")
                return res.json()
            })
            .then(setUsers)
            .catch(() => setUsers([]))
            .finally(() => setLoadingUsers(false))
    }, [])

    // Fetch vehicles
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [vehiclesError, setVehiclesError] = useState<string | null>(null);
    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const response = await fetch(`${API_URL}/vehicles/`, {
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Error al cargar vehículos");
                }

                const data = await response.json();
                setVehicles(Array.isArray(data) ? data : []);
                setVehiclesError(null);
            } catch (error) {
                console.error("Error loading vehicles:", error);
                setVehicles([]);
                setVehiclesError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar vehículos"
                );
            } finally {
                setLoadingVehicles(false);
            }
        };

        loadVehicles();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await fetch(`${API_URL}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken() || "",
                },
                credentials: "include",
                body: JSON.stringify({
                    appointment_time: values.appointment_time.toISOString(),
                    user_id: values.user_id,
                    vehicle_id: values.vehicle_id,
                    services: values.services.map((id) => ({
                        service_id: id,
                    }))
                }),
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            toast.success("Cita creada exitosamente")
            onSuccess()
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al crear la cita"
            )
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo de Fecha y Hora */}
                <FormField
                    control={form.control}
                    name="appointment_time"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha y Hora</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className="pl-3 text-left font-normal"
                                        >
                                            {field.value ? (
                                                format(field.value, "PPPp", { locale: es })
                                            ) : (
                                                <span>Selecciona una fecha</span>
                                            )}
                                            <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                    <div className="px-4 pb-4">
                                        <Select
                                            value={format(field.value, "HH:mm")}
                                            onValueChange={(time) => {
                                                const [hours, minutes] = time.split(":")
                                                const newDate = new Date(field.value)
                                                newDate.setHours(Number(hours))
                                                newDate.setMinutes(Number(minutes))
                                                field.onChange(newDate)
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona hora" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 10 }, (_, i) => {
                                                    const hour = 8 + i
                                                    return [`${hour}:00`, `${hour}:30`]
                                                })
                                                    .flat()
                                                    .map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo de Usuario */}
                <FormField
                    control={form.control}
                    name="user_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <IconUser className="h-4 w-4" />
                                Usuario
                            </FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={loadingUsers}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            loadingUsers ? "Cargando usuarios..." : "Selecciona un usuario"
                                        } />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-users" disabled>
                                            {loadingUsers ? "Cargando..." : "No hay usuarios disponibles"}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo de Vehículo */}
                <FormField
                    control={form.control}
                    name="vehicle_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <IconCar className="h-4 w-4" />
                                Vehículo
                            </FormLabel>
                            {vehiclesError ? (
                                <div className="text-red-500 text-sm">
                                    {vehiclesError}
                                </div>
                            ) : (
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                    }}
                                    value={field.value}
                                    disabled={loadingVehicles || vehicles.length === 0}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    loadingVehicles
                                                        ? "Cargando vehículos..."
                                                        : vehicles.length === 0
                                                            ? "No hay vehículos disponibles"
                                                            : "Selecciona un vehículo"
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {vehicles.map((vehicle) => (
                                            <SelectItem
                                                key={vehicle.plate}
                                                value={vehicle.plate}
                                            >
                                                {`${vehicle.brand} ${vehicle.model} (${vehicle.plate})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo de Servicios */}
                <FormField
                    control={form.control}
                    name="services"
                    render={() => (
                        <FormItem>
                            <FormLabel>Servicios</FormLabel>
                            {loadingServices ? (
                                <div className="flex items-center gap-2">
                                    <IconLoader className="h-4 w-4 animate-spin" />
                                    <span>Cargando servicios...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {services.map((service) => (
                                        <div key={service.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`service-${service.id}`}
                                                checked={form.watch("services").includes(service.id)}
                                                onCheckedChange={(checked) => {
                                                    const currentServices = form.getValues("services")
                                                    if (checked) {
                                                        form.setValue("services", [...currentServices, service.id])
                                                    } else {
                                                        form.setValue(
                                                            "services",
                                                            currentServices.filter((id) => id !== service.id)
                                                        )
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`service-${service.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                <div className="font-medium">{service.name}</div>
                                                <div className="text-muted-foreground text-sm">
                                                    ${service.price} • {service.duration} minutos
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit">
                        Crear Cita
                    </Button>
                </div>
            </form>
        </Form>
    )
}