"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"
import { API_URL } from "@/config/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormField,
    FormLabel,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form"

// Validaciones para ambas etapas
const emailSchema = z.object({
    email: z.string().email("Correo no válido"),
})

const resetSchema = z
    .object({
        new_password: z.string().min(6, "Mínimo 6 caracteres"),
        confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Las contraseñas no coinciden",
        path: ["confirm_password"],
    })

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export default function RecoverOrResetForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const isReset = Boolean(token)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    })

    const resetForm = useForm<ResetFormValues>({
        resolver: zodResolver(resetSchema),
        defaultValues: { new_password: "", confirm_password: "" },
    })

    const onSubmitEmail = async (values: EmailFormValues) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${API_URL}/auth/recover-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email }),
            })

            if (!response.ok) {
                const err = await response.json()
                toast.error(err.message || "Error al enviar el correo")
                setIsSubmitting(false)
            }

            toast.success("Correo de recuperación enviado")
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Error inesperado"
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const onSubmitReset = async (values: ResetFormValues) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    new_password: values.new_password,
                }),
            })

            if (!response.ok) {
                const err = await response.json()
                toast.error(err.message || "Error al cambiar la contraseña")
                setIsSubmitting(false)
            }

            toast.success("Contraseña actualizada correctamente")
            router.push("/login")
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Error inesperado"
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4">
                {isReset ? "Restablecer contraseña" : "Recuperar contraseña"}
            </h1>

            {isReset ? (
                <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-4">
                        <FormField
                            control={resetForm.control}
                            name="new_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={resetForm.control}
                            name="confirm_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Restableciendo..." : "Cambiar contraseña"}
                        </Button>
                    </form>
                </Form>
            ) : (
                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                        <FormField
                            control={emailForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="ejemplo@correo.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Enviando..." : "Enviar correo"}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    )
}