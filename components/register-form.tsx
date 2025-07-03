"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { API_URL } from "@/config/config"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"


const registerShema = z.object({
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(10, "El número de teléfono debe tener al menos 10 dígitos"),
  password: z.string().min(9, "La contraseña debe tener al menos 9 caracteres"),
  confirmPassword: z.string().min(9, "La confirmación de contraseña debe tener al menos 9 caracteres"),
})

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  const form = useForm<z.infer<typeof registerShema>>({
    resolver: zodResolver(registerShema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof registerShema>) => {
    const { confirmPassword, ...dataToSend } = data
    // Validar que las contraseñas coincidan
    if (dataToSend.password !== confirmPassword) {
      form.setError("confirmPassword", { message: "Las contraseñas no coinciden" })
      toast.error("Las contraseñas no coinciden")
      return
    }

    try {
      toast.loading("Registrando usuario...")

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const result = await res.json()
      toast.dismiss() // cierra el loading

      if (!res.ok) {
        form.setError("password", { message: result.message || "Credenciales inválidas" })
        toast.error(result.message || "Error de autenticación")
        return
      }

      toast.success("Inicio de sesión exitoso")
      router.push("/login")

    } catch (error) {
      toast.dismiss()
      form.setError("password", { message: "Error al conectar con el servidor" })
      toast.error("No se pudo conectar con el servidor")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Regístrate</CardTitle>
          <CardDescription>Ingresa tus datos para crear una cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
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
              <Button type="submit" className="w-full">Registrarse</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
