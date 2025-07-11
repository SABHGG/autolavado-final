"use client"

import { useRouter } from "next/navigation"
import { NewVehicleForm } from "@/components/new-vehicle-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function NewVehiclePage() {
    const router = useRouter()

    const handleSuccess = () => {
        router.push("/dashboard/vehicles")
        router.refresh() // Para actualizar la lista de citas
    }

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Crear un nuevo vehiculo</CardTitle>
                    <CardDescription>
                        Complete todos los campos para crear un nuevo vehiculo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NewVehicleForm
                        onSuccess={handleSuccess}
                        onCancel={() => router.push("/dashboard/vehicles")}
                    />
                </CardContent>
            </Card>
        </div>
    )
}