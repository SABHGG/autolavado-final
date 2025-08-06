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
import { IconCar, IconLoader } from "@tabler/icons-react"
import { CalendarIcon } from "lucide-react"
import { API_URL } from "@/config/config"
import { getCsrfToken } from "@/lib/getcrfstoken"

const formSchema = z.object({
    appointment_time: z.date({
        required_error: "La fecha y hora son requeridas",
    }),
    vehicle_id: z.string().min(1, "Vehículo es requerido"),
    services: z.array(z.number()).min(1, "Al menos un servicio es requerido"),
})

interface Service {
    id: number
    name: string
    price: number
    duration: number
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
            vehicle_id: "",
            services: [],
        },
    })

    // Fetch services
    const [services, setServices] = useState<Service[]>([])
    const [loadingServices, setLoadingServices] = useState(true)
    useEffect(() => {
        setLoadingServices(true)
        const loadServices = async () => {
            try {
                const response = await fetch(`${API_URL}/services`, {
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Error al cargar vehículos");
                }

                const data = await response.json();
                setServices(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Error loading vehicles:", error);
                setServices([]);
            } finally {
                setLoadingServices(false);
            }
        }
        loadServices()
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
                setVehicles(Array.isArray(data.data) ? data.data : []);
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        const date = new Date(values.appointment_time);

        // Crear string ISO con offset local explícito
        const pad = (n: number) => n.toString().padStart(2, '0');
        const timezoneOffset = -date.getTimezoneOffset();
        const offsetSign = timezoneOffset >= 0 ? '+' : '-';
        const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
        const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

        const localISOTime =
            `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
            `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
            `${offsetSign}${offsetHours}:${offsetMinutes}`;
        try {
            const response = await fetch(`${API_URL}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken() || ""
                },
                credentials: "include",
                body: JSON.stringify({
                    appointment_time: localISOTime,
                    vehicle_id: values.vehicle_id,
                    services: values.services.map((id) => ({ service_id: id })),
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
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo de Fecha y Hora */}
                <FormField
                    control={form.control}
                    name="appointment_time"
                    render={({ field }) => {
                        // Función para aplicar la hora seleccionada (manteniendo hora local)
                        const handleTimeChange = (time: string) => {
                            const [hours, minutes] = time.split(":");
                            const date = field.value ? new Date(field.value) : new Date();

                            // Mantener como hora local SIN conversión a UTC
                            date.setHours(Number(hours));
                            date.setMinutes(Number(minutes));
                            date.setSeconds(0);
                            date.setMilliseconds(0);

                            field.onChange(date); // Enviar como fecha local
                        };

                        // Generar opciones de tiempo cada 30 minutos
                        const generateTimeSlots = () => {
                            const slots = [];
                            for (let hour = 0; hour < 24; hour++) {
                                slots.push(
                                    { value: `${hour.toString().padStart(2, "0")}:00`, label: `${hour.toString().padStart(2, "0")}:00` },
                                    { value: `${hour.toString().padStart(2, "0")}:30`, label: `${hour.toString().padStart(2, "0")}:30` }
                                );
                            }
                            return slots;
                        };

                        // Función para deshabilitar fechas pasadas
                        const isDateDisabled = (date: Date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                        };

                        const isTimeDisabled = (date: Date, timeSlot: string) => {
                            const [hours, minutes] = timeSlot.split(":").map(Number);
                            const slotDate = new Date(date);
                            slotDate.setHours(hours, minutes);

                            return slotDate < new Date(); // Deshabilitar horas pasadas
                        };

                        return (
                            <FormItem className="flex flex-col space-y-2">
                                <FormLabel className="font-medium">Fecha y Hora</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value
                                                ? `${format(field.value, "PPP", { locale: es })} a las ${format(field.value, "HH:mm")}`
                                                : "Selecciona fecha y hora"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-4 space-y-4">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            locale={es}
                                            onSelect={(date) => {
                                                if (!date) return;
                                                const newDate = new Date(date);
                                                if (field.value) {
                                                    // Mantener la hora seleccionada previamente
                                                    newDate.setHours(field.value.getHours());
                                                    newDate.setMinutes(field.value.getMinutes());
                                                } else {
                                                    // Hora por defecto: primera disponible del día
                                                    newDate.setHours(8, 0, 0, 0);
                                                }
                                                field.onChange(newDate);
                                            }}
                                            disabled={isDateDisabled}
                                        />

                                        <div>
                                            <p className="text-sm font-medium mb-2">Selecciona hora</p>
                                            <Select
                                                value={field.value ? format(field.value, "HH:mm") : undefined}
                                                onValueChange={handleTimeChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona hora" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {generateTimeSlots().map((slot) => (
                                                        <SelectItem
                                                            key={slot.value}
                                                            value={slot.value}
                                                            disabled={field.value && isTimeDisabled(field.value, slot.value)}
                                                        >
                                                            {slot.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
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
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <IconLoader className="h-4 w-4 animate-spin mr-2" />
                                Creando...
                            </>
                        ) : (
                            "Crear Cita"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}