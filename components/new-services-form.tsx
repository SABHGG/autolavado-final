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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    description: z.string().min(1, "La descripción es requerida"),
    duration: z.string().min(1, "La duración es requerida"),
})

export function NewServiceForm({
    onSuccess,
    onCancel,
}: {
    onSuccess: () => void
    onCancel: () => void
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: 0,
            description: "",
            duration: "",
        },
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${API_URL}/services/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken() || "",
                },
                credentials: "include",
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            toast.success("Servicio creado exitosamente")
            onSuccess()
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al crear el servicio"
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nombre del Servicio */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Servicio</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ej: Cambio de aceite"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Precio */}
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    placeholder="Ej: 50.00"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Duración */}
                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duración estimada</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ej: 30 minutos"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Descripción */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Descripción detallada del servicio"
                                    className="resize-none"
                                    rows={4}
                                />
                            </FormControl>
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
                                Creando...
                            </>
                        ) : (
                            "Crear Servicio"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}