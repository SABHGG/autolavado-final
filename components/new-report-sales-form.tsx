"use client"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { API_URL } from "@/config/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    start_date: z.string().min(1, "Fecha inicial requerida"),
    end_date: z.string().min(1, "Fecha final requerida"),
})

export function SalesReportForm() {
    const [isDownloading, setIsDownloading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start_date: "",
            end_date: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsDownloading(true)
        try {
            const queryParams = new URLSearchParams(values).toString()
            const res = await fetch(`${API_URL}/reports/sales?${queryParams}`, {
                method: "GET",
                credentials: "include",
            })

            if (!res.ok) {
                const errorData = await res.json()
                toast.error(errorData.message || "Ocurrió un error")
                return
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `reporte_ventas_${values.start_date}_al_${values.end_date}.xlsx`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)

            toast.success("Reporte descargado correctamente")
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Error al descargar el reporte"
            )
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 max-w-md"
            >
                <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha inicial</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha final</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isDownloading}>
                        {isDownloading ? "Descargando..." : "Descargar reporte"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
