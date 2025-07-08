"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { IconLoader } from "@tabler/icons-react"
import { API_URL } from "@/config/config"
import { getCsrfToken } from "@/lib/getcrfstoken"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const vehicleFormSchema = z.object({
    plate: z.string()
        .min(6, "La matrícula debe tener exactamente 6 caracteres (3 letras + 3 números)")
        .max(6, "La matrícula debe tener exactamente 6 caracteres (3 letras + 3 números)")
        .regex(/^[A-Z]{3}\d{3}$/, "Formato inválido. Debe ser 3 letras seguidas de 3 números (ej: ABC123)")
        .transform(val => val.toUpperCase()),
    brand: z.string()
        .min(2, "La marca debe tener al menos 2 caracteres")
        .max(50, "La marca no puede exceder 50 caracteres"),
    model: z.string()
        .min(2, "El modelo debe tener al menos 2 caracteres")
        .max(50, "El modelo no puede exceder 50 caracteres"),
    color: z.string()
        .min(2, "El color debe tener al menos 2 caracteres")
        .max(30, "El color no puede exceder 30 caracteres"),
    vehicle_type: z.enum([
        "motocicleta",
        "coche",
        "camion",
        "autobus",
        "furgoneta"
    ], {
        required_error: "Debe seleccionar un tipo de vehículo",
    })
})

export function NewVehicleForm({
    onSuccess,
    onCancel,
}: {
    onSuccess: () => void
    onCancel: () => void
}) {
    const form = useForm<z.infer<typeof vehicleFormSchema>>({
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: {
            plate: "",
            brand: "",
            model: "",
            color: "",
            vehicle_type: "coche",
        },
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: z.infer<typeof vehicleFormSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${API_URL}/vehicles/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken() || "",
                },
                credentials: "include",
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Error al crear el vehículo")
            }

            toast.success("Vehículo registrado exitosamente")
            onSuccess()
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al registrar el vehículo"
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Matrícula */}
                <FormField
                    control={form.control}
                    name="plate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Matrícula</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ej: ABC123"
                                    autoComplete="off"
                                    maxLength={6}
                                    onChange={(e) => {
                                        // Filtra solo letras y números
                                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                        // Limita a 3 letras seguidas de números
                                        let formattedValue = value
                                        if (value.length > 3) {
                                            formattedValue =
                                                value.substring(0, 3).toUpperCase() +
                                                value.substring(3).replace(/\D/g, '')
                                        }
                                        field.onChange(formattedValue)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Marca */}
                <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ej: Toyota"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Modelo */}
                <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ej: Corolla"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Color */}
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ej: Rojo"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Tipo de vehículo */}
                <FormField
                    control={form.control}
                    name="vehicle_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de vehículo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="motocicleta">Motocicleta</SelectItem>
                                    <SelectItem value="coche">Coche</SelectItem>
                                    <SelectItem value="camion">Camión</SelectItem>
                                    <SelectItem value="autobus">Autobús</SelectItem>
                                    <SelectItem value="furgoneta">Furgoneta</SelectItem>
                                </SelectContent>
                            </Select>
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
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            "Registrar Vehículo"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}