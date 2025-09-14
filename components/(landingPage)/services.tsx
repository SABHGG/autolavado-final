import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const enjuagueData = [
    { tipo: "Automovil", precio: "15.000" },
    { tipo: "Camioneta básica sin platón", precio: "20.000" },
    { tipo: "Camioneta básica con platón", precio: "25.000" },
    { tipo: "Camioneta 4X4", precio: "25.000" },
    { tipo: "Furgón sencillo", precio: "30.000" },
    { tipo: "Furgón doble troque pequeño", precio: "45.000" },
    { tipo: "Furgón doble troque grande", precio: "55.000" },
    { tipo: "Busetas pequeñas", precio: "45.000" },
    { tipo: "Busetas grandes y buses", precio: "50.000" },
    { tipo: "Camiones", precio: "50.000" },
]

const generalData = [
    { tipo: "Automovil", precio: "30.000" },
    { tipo: "Camioneta básica sin platón", precio: "40.000" },
    { tipo: "Camioneta básica con platón", precio: "50.000" },
    { tipo: "Camioneta 4X4", precio: "50.000" },
    { tipo: "Furgón sencillo", precio: "60.000" },
    { tipo: "Furgón doble troque pequeño", precio: "55.000" },
    { tipo: "Furgón doble troque grande", precio: "60.000" },
    { tipo: "Busetas pequeñas", precio: "60.000" },
    { tipo: "Busetas grandes y buses", precio: "70.000" },
    { tipo: "Camiones", precio: "70.000" },
]

function ServicesTable({ title, data }: { title: string; data: { tipo: string; precio: string }[] }) {
    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="text-center text-primary">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tipo Equipo</TableHead>
                            <TableHead>Valor sin IVA</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell>{row.tipo}</TableCell>
                                <TableCell>{row.precio}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function Services() {
    return (
        <section id="servicios" className="py-12 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-primary">
                    Nuestros Servicios
                </h2>
                <div className="flex flex-col md:flex-row gap-8 justify-center">
                    <ServicesTable title="Enjuague" data={enjuagueData} />
                    <ServicesTable title="General" data={generalData} />
                </div>
                <p className="mt-6 text-center text-gray-500 text-sm">
                    Los precios y servicios se encuentran sujetos a cambios, teniendo en cuenta las exigencias de nuestros clientes.
                </p>
            </div>
        </section>
    )
}
