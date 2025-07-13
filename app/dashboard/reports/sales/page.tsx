"use client"
import { SalesReportForm } from "@/components/new-report-sales-form"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"

export default function SalesReportPage() {

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Generar Reporte de Ventas</CardTitle>
                    <CardDescription>
                        Selecciona el rango de fechas para generar y descargar el reporte de
                        ventas en Excel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SalesReportForm />
                </CardContent>
            </Card>
        </div>
    )
}
