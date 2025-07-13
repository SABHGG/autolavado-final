import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


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
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Citas Hoy</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {appointments_today}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconTrendingUp />
                            +1 cita
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Actividad del día <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Total de servicios hoy</div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Ingresos Hoy</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        ${income_today.toLocaleString("es-CO")}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconTrendingUp />
                            +${income_today.toLocaleString("es-CO")}
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Buen desempeño <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Suma total de ventas hoy</div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Servicio Más Solicitado</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {most_requested_service.name}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconTrendingUp />
                            {most_requested_service.count} vez
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Servicio top del día <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Más vendido hoy</div>
                </CardFooter>
            </Card>
        </div>
    )
}
