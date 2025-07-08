"use client"

import { useRouter } from "next/navigation"
import { NewServiceForm } from "@/components/new-services-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function NewServicesPage() {
    const router = useRouter()

    const handleSuccess = () => {
        router.push("/dashboard/services")
        router.refresh() // Para actualizar la lista de citas
    }

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Crear un nuevo servicio</CardTitle>
                    <CardDescription>
                        Complete todos los campos para crear un nuevo servicio
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NewServiceForm
                        onSuccess={handleSuccess}
                        onCancel={() => router.push("/dashboard/services")}
                    />
                </CardContent>
            </Card>
        </div>
    )
}