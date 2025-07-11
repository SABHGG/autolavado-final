"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useProtectedPage } from "@/hooks/useProtectedPage";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const breadcrumbs = useBreadcrumbs();
    useProtectedPage();

    function capitalize(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1)
    }
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={index} className="flex items-center">
                                        <BreadcrumbItem>
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage>{capitalize(breadcrumb.name)}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink href={breadcrumb.href}>
                                                    {capitalize(breadcrumb.name)}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                    </div>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}