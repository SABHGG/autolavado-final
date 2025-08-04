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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { IconCar, IconUser, IconLoader } from "@tabler/icons-react"
import { getCsrfToken } from "@/lib/getcrfstoken"
import { API_URL } from "@/config/config"
import { CalendarIcon, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    appointment_time: z.date({
        required_error: "La fecha y hora son requeridas",
    }),
    user_id: z.string().min(1, "Usuario es requerido"),
    vehicle_id: z.string().min(1, "Vehículo es requerido"),
    services: z.array(z.number()).min(1, "Al menos un servicio es requerido"),
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

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
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
                setLoadingServices(false);
            } catch (error) {
                console.error("Error loading vehicles:", error);
                setServices([]);
            } finally {
                setLoadingServices(false);
            }
        }
        loadServices()
    }, [])

    // Users state
    const [users, setUsers] = useState<User[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [userSearchTerm, setUserSearchTerm] = useState("")
    const [usersError, setUsersError] = useState<string | null>(null);
    const debouncedSearchTerm = useDebounce(userSearchTerm, 300);

    // Load users
    useEffect(() => {
        setLoadingUsers(true)
        const loadUsers = async () => {
            try {
                setUsers([]);
                const response = await fetch(`${API_URL}/users/all?search=${debouncedSearchTerm}`, {
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Error al cargar usuarios");
                }

                const data = await response.json();
                setUsers(Array.isArray(data.data) ? data.data : []);
                setUsersError(null);
                setLoadingUsers(false);
            } catch (error) {
                console.error("Error loading usuarios:", error);
                setUsers([]);
                setUsersError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar usuarios"
                );
            } finally {
                setLoadingUsers(false);
            }
        }
        loadUsers()
    }, [debouncedSearchTerm])


    // Vehicles state
    const [userVehicles, setUserVehicles] = useState<Vehicle[]>([])
    const [loadingVehicles, setLoadingVehicles] = useState(false)
    const [vehiclesError, setVehiclesError] = useState<string | null>(null)
    const { watch, setValue } = form

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "user_id") {
                const userId = value.user_id;

                if (!userId) {
                    setUserVehicles([])
                    setValue("vehicle_id", "")
                    return
                }

                const loadUserVehicles = async () => {
                    setLoadingVehicles(true)
                    setVehiclesError(null)

                    try {
                        const response = await fetch(`${API_URL}/vehicles/${userId}`, {
                            credentials: "include"
                        })

                        const data = await response.json()
                        setUserVehicles(Array.isArray(data) ? data : [])

                        // Auto-select if only one vehicle
                        if (data.length === 1) {
                            setValue("vehicle_id", data[0].plate)
                        } else {
                            setValue("vehicle_id", "")
                        }
                    } catch (error) {
                        console.error("Error loading user vehicles:", error)
                        setUserVehicles([])
                        setVehiclesError(
                            error instanceof Error
                                ? error.message
                                : "Error al cargar vehículos del usuario"
                        )
                        setValue("vehicle_id", "")
                    } finally {
                        setLoadingVehicles(false)
                    }
                }

                loadUserVehicles()
            }
        })

        return () => subscription.unsubscribe()
    }, [watch, setValue])


    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false)

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            // Ajuste de zona horaria: compensa el desfase local antes de enviar con toISOString()
            const localToUTC = new Date(values.appointment_time.getTime() - values.appointment_time.getTimezoneOffset() * 60000);
            const response = await fetch(`${API_URL}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken() || "",
                },
                credentials: "include",
                body: JSON.stringify({
                    appointment_time: localToUTC.toISOString(),
                    vehicle_id: values.vehicle_id,
                    user_id: values.user_id,
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
                        // Función para aplicar la hora seleccionada (corrigiendo desfase de zona horaria al enviar)
                        const handleTimeChange = (time: string) => {
                            const [hours, minutes] = time.split(":");
                            const newDate = field.value ? new Date(field.value) : new Date();

                            newDate.setHours(Number(hours));
                            newDate.setMinutes(Number(minutes));
                            newDate.setSeconds(0);
                            newDate.setMilliseconds(0);

                            field.onChange(newDate);
                        };

                        // Generar opciones de tiempo cada 30 minutos
                        const generateTimeSlots = () => {
                            return Array.from({ length: 24 }, (_, hour) => [
                                { value: `${hour.toString().padStart(2, "0")}:00`, label: `${hour.toString().padStart(2, "0")}:00` },
                                { value: `${hour.toString().padStart(2, "0")}:30`, label: `${hour.toString().padStart(2, "0")}:30` }
                            ]).flat();
                        };

                        return (
                            <FormItem className="flex flex-col space-y-2">
                                <FormLabel className="font-medium">Fecha y Hora</FormLabel>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value
                                                ? `${format(field.value, "PPP", { locale: es })} ${format(field.value, "HH:mm")}`
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
                                                    newDate.setHours(field.value.getHours());
                                                    newDate.setMinutes(field.value.getMinutes());
                                                }
                                                field.onChange(newDate);
                                            }}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                                                        <SelectItem key={slot.value} value={slot.value}>
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

                {/* Campo de Usuario con buscador */}
                <FormField
                    control={form.control}
                    name="user_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col relative">
                            <FormLabel className="flex items-center gap-2">
                                <IconUser className="h-4 w-4" />
                                Usuario
                            </FormLabel>

                            {usersError ? (
                                <div className="text-red-500 text-sm">{usersError}</div>
                            ) : (
                                <div className="relative">
                                    <Command shouldFilter={false} className="rounded-lg border shadow-md">
                                        <CommandInput
                                            placeholder="Buscar usuario..."
                                            value={userSearchTerm}
                                            onValueChange={setUserSearchTerm}
                                            onFocus={() => setIsOpen(true)}
                                            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                                        />

                                        {isOpen && (
                                            <CommandList className="absolute top-full left-0 w-full z-10 bg-white border border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-auto">
                                                {loadingUsers ? (
                                                    <div className="py-3 text-center text-sm">
                                                        <IconLoader className="h-4 w-4 animate-spin mx-auto" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <CommandEmpty>No se encontraron usuarios</CommandEmpty>
                                                        <CommandGroup>
                                                            {users.map((user) => (
                                                                <CommandItem
                                                                    key={user.id}
                                                                    value={user.id}
                                                                    onSelect={() => {
                                                                        form.setValue("user_id", user.id)
                                                                        form.setValue("vehicle_id", "")
                                                                        setIsOpen(false)
                                                                    }}
                                                                    className="cursor-pointer hover:bg-gray-100"
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            field.value === user.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span>{user.name}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {user.email}
                                                                        </span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </>
                                                )}
                                            </CommandList>
                                        )}
                                    </Command>
                                </div>
                            )}
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
                                {form.watch("user_id") && (
                                    <span className="text-sm text-muted-foreground ml-auto">
                                        {userVehicles.length} vehículo(s)
                                    </span>
                                )}
                            </FormLabel>
                            {vehiclesError ? (
                                <div className="text-red-500 text-sm">
                                    {vehiclesError}
                                </div>
                            ) : (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={loadingVehicles || !form.watch("user_id") || userVehicles.length === 0}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    !form.watch("user_id")
                                                        ? "Seleccione un usuario primero"
                                                        : loadingVehicles
                                                            ? "Cargando vehículos..."
                                                            : userVehicles.length === 0
                                                                ? "Este usuario no tiene vehículos"
                                                                : "Selecciona un vehículo"
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {userVehicles.map((vehicle) => (
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
                                                checked={form.watch("services").includes(Number(service.id))}
                                                onCheckedChange={(checked) => {
                                                    const currentServices = form.getValues("services")
                                                    if (checked) {
                                                        form.setValue("services", [...currentServices, Number(service.id)])
                                                    } else {
                                                        form.setValue(
                                                            "services",
                                                            currentServices.filter((id) => id !== Number(service.id))
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