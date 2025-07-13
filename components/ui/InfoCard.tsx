
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

type InfoCardProps = {
    title: string
    value: string | number
    badge: string
    badgeIcon?: React.ReactNode
    footerTitle: string
    footerDesc: string
}

function InfoCard({ title, value, badge, badgeIcon, footerTitle, footerDesc }: InfoCardProps) {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                <CardAction>
                    <Badge variant="outline">
                        {badgeIcon}
                        {badge}
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {footerTitle} <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">{footerDesc}</div>
            </CardFooter>
        </Card>
    )
}

export default InfoCard