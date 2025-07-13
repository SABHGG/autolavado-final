import { IconTrendingUp } from "@tabler/icons-react"
import InfoCard from "@/components/ui/InfoCard"


type SectionCardsProps = {
    appointments_today: number
    income_today: number
    most_requested_service: {
        name: string
        count: number
    }
}

export function SectionCards({
    appointments_today,
    income_today,
    most_requested_service,
}: SectionCardsProps) {

    return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-3">
            <InfoCard
                title="Citas Hoy"
                value={appointments_today === 0 ? "Sin citas" : appointments_today.toLocaleString("es-CO")}
                badge={
                    appointments_today === 0 ? "Ninguna cita" : `+${appointments_today} citas`
                }
                badgeIcon={<IconTrendingUp />}
                footerTitle="Actividad del día"
                footerDesc="Total de servicios hoy"
            />

            <InfoCard
                title="Ingresos Hoy"
                value={
                    income_today === 0
                        ? "Sin ingresos"
                        : `$${income_today.toLocaleString("es-CO")}`
                }
                badge={`+$${income_today === 0 ? "0" : income_today.toLocaleString("es-CO")}`}
                badgeIcon={<IconTrendingUp />}
                footerTitle="Buen desempeño"
                footerDesc="Suma total de ventas hoy"
            />

            <InfoCard
                title="Servicio Más Solicitado"
                value={most_requested_service.name || "Ninguno"}
                badge={
                    most_requested_service.count === 0
                        ? "Ninguno"
                        : `${most_requested_service.count.toLocaleString("es-CO")} ${most_requested_service.count === 1 ? "vez" : "veces"}`
                }
                badgeIcon={<IconTrendingUp />}
                footerTitle="Servicio top del día"
                footerDesc="Más vendido hoy"
            />
        </div>
    )
}
