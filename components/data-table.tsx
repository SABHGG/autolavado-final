"use client"
import * as React from "react"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    IconCalendar,
    IconCar,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconCircleCheckFilled,
    IconClock,
    IconDotsVertical,
    IconGripVertical,
    IconLayoutColumns,
    IconLoader,
    IconPlus,
    IconProgress,
    IconUser,
    IconUxCircle,
    IconCheck
} from "@tabler/icons-react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
} from "@/components/ui/tabs"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { API_URL } from "@/config/config";
import { User } from "@/types/types"
import { fetchEmployees } from "@/services/employees"
import { getCsrfToken } from "@/lib/getcrfstoken"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"


export const schema = z.object({
    id: z.number(),
    appointment_time: z.string().datetime(),
    status: z.string(),
    user_id: z.string().uuid(),
    vehicle_id: z.string(),
    created_at: z.string().datetime(),
})

function DragHandle({ id }: { id: number }) {
    const { attributes, listeners } = useSortable({
        id,
    })

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Arrastrar para reordenar</span>
        </Button>
    )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Seleccionar todo"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Seleccionar fila"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => row.original.id,
    },
    {
        accessorKey: "appointment_time",
        header: "Fecha y Hora",
        cell: ({ row }) => {
            const date = new Date(row.original.appointment_time)
            return (
                <div className="flex items-center gap-2">
                    <IconCalendar className="size-4" />
                    {format(date, "PPP", { locale: es })} a las {format(date, "p", { locale: es })}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.original.status as 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
            const statusLabels: Record<'pendiente' | 'en_progreso' | 'completada' | 'cancelada', string> = {
                pendiente: "Pendiente",
                en_progreso: "En progreso",
                completada: "Completada",
                cancelada: "Cancelada",
            };

            const statusIcons: Record<'pendiente' | 'en_progreso' | 'completada' | 'cancelada', React.ReactNode> = {
                pendiente: <IconLoader className="mr-1 size-3" />,
                en_progreso: <IconLoader className="mr-1 size-3 animate-spin" />,
                completada: <IconCircleCheckFilled className="mr-1 size-3" />,
                cancelada: <IconCircleCheckFilled className="mr-1 size-3 text-red-500" />,
            };

            return (
                <Badge variant={status === "pendiente" ? "outline" : "default"}>
                    {statusIcons[status]}
                    {statusLabels[status] || status}
                </Badge>
            );
        }
    },
    {
        accessorKey: "user_id",
        header: "Usuario",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <IconUser className="size-4" />
                {row.original.user_id.substring(0, 8)}...
            </div>
        ),
    },
    {
        accessorKey: "vehicle_id",
        header: "Vehículo",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <IconCar className="size-4" />
                {row.original.vehicle_id}
            </div>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Creado el",
        cell: ({ row }) => format(new Date(row.original.created_at), "PPPp", { locale: es }),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = useUser() as User | null | undefined
            const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false)
            const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = React.useState(false)
            const [employees, setEmployees] = React.useState<User[]>([])
            const [selectedEmployee, setSelectedEmployee] = React.useState("")
            const [newAppointmentTime, setNewAppointmentTime] = React.useState(
                new Date(row.original.appointment_time)
            )
            const [isLoadingEmployees, setIsLoadingEmployees] = React.useState(false)

            const [isDialogOpen, setIsDialogOpen] = React.useState(false)
            const [selectedStatus, setSelectedStatus] = React.useState<AppointmentStatus | null>(null)
            const [isProcessing, setIsProcessing] = React.useState(false)

            // Cargar empleados cuando se abre el diálogo de asignación
            React.useEffect(() => {
                if (isAssignDialogOpen && employees.length === 0) {
                    const loadEmployees = async () => {
                        setIsLoadingEmployees(true)
                        try {
                            const fetchedEmployees = await fetchEmployees()
                            setEmployees(fetchedEmployees)
                        } catch (error) {
                            toast.error('Error al cargar los empleados')
                        } finally {
                            setIsLoadingEmployees(false)
                        }
                    }
                    loadEmployees()
                }
            }, [isAssignDialogOpen, employees.length])

            const csrfToken = getCsrfToken();
            type AppointmentStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'

            // Función para formatear la fecha en formato compatible con Python datetime
            const formatForBackend = (date: Date) => {
                return date.toISOString().replace('Z', '') // Elimina la Z final para compatibilidad
            }

            const handleEdit = () => {
                // Abrir modal de edición con los datos actuales
                toast.info(`Editando cita #${row.original.id}`)
            }

            const getStatusLabel = (status: AppointmentStatus) => {
                const labels = {
                    pendiente: 'Pendiente',
                    en_progreso: 'En progreso',
                    completada: 'Completada',
                    cancelada: 'Cancelada'
                }
                return labels[status]
            }

            const handleStatusSelection = (status: AppointmentStatus) => {
                setSelectedStatus(status)
                setIsDialogOpen(true)
            }

            const handleAssign = async () => {
                try {
                    const response = await fetch(`${API_URL}/appointments/${row.original.id}/assign`, {
                        method: 'PATCH',
                        headers: Object.fromEntries(
                            Object.entries({
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken
                            }).filter(([_, v]) => v !== undefined)
                        ) as Record<string, string>,
                        body: JSON.stringify({
                            employee_id: selectedEmployee // Ahora usa el ID del empleado real
                        }),
                        credentials: 'include'
                    })

                    if (response.ok) {
                        const assignedEmployee = employees.find(e => e.id === selectedEmployee)
                        toast.success(`Cita asignada a ${assignedEmployee?.username || 'el empleado'}`)
                        setIsAssignDialogOpen(false)
                        setSelectedEmployee("")
                    } else {
                        throw new Error(await response.text())
                    }
                } catch (error) {
                    toast.error('Error al asignar la cita')
                    console.error('Error:', error)
                }
            }

            const handleReschedule = async () => {
                try {
                    const formattedDate = formatForBackend(newAppointmentTime)

                    const response = await fetch(`${API_URL}/appointments/${row.original.id}`, {
                        method: 'PUT',
                        headers: Object.fromEntries(
                            Object.entries({
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken
                            }).filter(([_, v]) => v !== undefined)
                        ) as Record<string, string>,
                        body: JSON.stringify({
                            appointment_time: formattedDate
                        }),
                        credentials: 'include'
                    })

                    if (response.ok) {
                        toast.success(`Cita reprogramada para ${format(newAppointmentTime, "PPPp", { locale: es })}`)
                        setIsRescheduleDialogOpen(false)
                    } else {
                        throw new Error(await response.text())
                    }
                } catch (error) {
                    toast.error('Error al reprogramar la cita')
                    console.error('Error:', error)
                }
            }

            const handleStatusChange = async (newStatus: AppointmentStatus) => {
                setIsProcessing(true)
                try {
                    const response = await fetch(`${API_URL}/appointments/${row.original.id}/status`,
                        {
                            method: 'PATCH',
                            headers: Object.fromEntries(
                                Object.entries({
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': csrfToken
                                }).filter(([_, v]) => v !== undefined)
                            ) as Record<string, string>,
                            body: JSON.stringify({
                                status: newStatus,
                            }),
                            credentials: 'include',
                        }
                    )

                    if (!response.ok) throw new Error(await response.text())

                    toast.success(`Estado cambiado a ${getStatusLabel(newStatus)}`)
                    return true
                } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Error al actualizar estado')
                    return false
                } finally {
                    setIsProcessing(false)
                    setIsDialogOpen(false)
                }
            }

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                size="icon"
                            >
                                <IconDotsVertical />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            {
                                user?.role === "admin" && (
                                    <>
                                        <DropdownMenuItem onClick={handleEdit}>
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsAssignDialogOpen(true)}>
                                            <span>Asignar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsRescheduleDialogOpen(true)}>
                                            <span>Reprogramar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleStatusSelection('pendiente')}
                                            disabled={row.original.status === 'pendiente'}
                                        >
                                            <div className="flex items-center gap-2">
                                                <IconClock className="h-4 w-4" />
                                                <span>Marcar como pendiente</span>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleStatusSelection('en_progreso')}
                                            disabled={row.original.status === 'en_progreso'}
                                        >
                                            <div className="flex items-center gap-2">
                                                <IconProgress className="h-4 w-4" />
                                                <span>Iniciar progreso</span>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleStatusSelection('completada')}
                                            disabled={row.original.status === 'completada'}
                                        >
                                            <div className="flex items-center gap-2">
                                                <IconCheck className="h-4 w-4" />
                                                <span>Marcar como completada</span>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )
                            }
                            <DropdownMenuItem
                                onClick={() => handleStatusSelection('cancelada')}
                                disabled={row.original.status === 'cancelada'}
                                className="text-destructive focus:text-destructive"
                            >
                                <div className="flex items-center gap-2">
                                    <IconUxCircle className="h-4 w-4" />
                                    <span>Cancelar cita</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Diálogo para asignar técnico - Modificado para usar empleados reales */}
                    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Asignar empleado</DialogTitle>
                                <DialogDescription>
                                    Selecciona un empleado para la cita #{row.original.id}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="employee" className="text-right">
                                        Empleado
                                    </Label>
                                    {isLoadingEmployees ? (
                                        <div className="col-span-3 flex items-center justify-center">
                                            <IconLoader className="animate-spin mr-2" />
                                            Cargando empleados...
                                        </div>
                                    ) : (
                                        <Select
                                            value={selectedEmployee}
                                            onValueChange={setSelectedEmployee}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Selecciona un empleado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.length > 0 ? (
                                                    employees.map((employee) => (
                                                        <SelectItem
                                                            key={employee.id}
                                                            value={employee.id}
                                                        >
                                                            {employee.username} ({employee.email})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="" disabled>
                                                        No hay empleados disponibles
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAssignDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedEmployee || isLoadingEmployees}
                                >
                                    Asignar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Diálogo para reprogramar */}
                    <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reprogramar cita</DialogTitle>
                                <DialogDescription>
                                    Selecciona una nueva fecha para la cita #{row.original.id}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="newDate" className="text-right">
                                        Nueva fecha
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="col-span-3 justify-start text-left font-normal"
                                            >
                                                <IconCalendar className="mr-2 h-4 w-4" />
                                                {newAppointmentTime ? (
                                                    format(newAppointmentTime, "PPPp", { locale: es })
                                                ) : (
                                                    <span>Selecciona una fecha</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={newAppointmentTime}
                                                onSelect={(date) => date && setNewAppointmentTime(date)}
                                                initialFocus
                                            />
                                            <div className="px-4 pb-4">
                                                <Label>Tiempo</Label>
                                                <Select
                                                    value={format(newAppointmentTime, "HH:mm")}
                                                    onValueChange={(time) => {
                                                        const [hours, minutes] = time.split(":")
                                                        const newDate = new Date(newAppointmentTime)
                                                        newDate.setHours(Number(hours))
                                                        newDate.setMinutes(Number(minutes))
                                                        setNewAppointmentTime(newDate)
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                                                            <SelectItem key={time} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsRescheduleDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleReschedule}>
                                    Confirmar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Diálogo para cambiar el estado */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar cambio de estado</DialogTitle>
                                <DialogDescription>
                                    {selectedStatus === 'cancelada' ? (
                                        <span>¿Estás seguro de cancelar esta cita? Esta acción no se puede deshacer.</span>
                                    ) : (
                                        <span>¿Deseas cambiar el estado a <strong>{getStatusLabel(selectedStatus!)}</strong>?</span>
                                    )}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isProcessing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => selectedStatus && handleStatusChange(selectedStatus)}
                                    disabled={isProcessing}
                                    variant={selectedStatus === 'cancelada' ? 'destructive' : 'default'}
                                >
                                    {isProcessing ? (
                                        <IconLoader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <span>Confirmar</span>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )
        }
    }
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

export function DataTable({
    data: initialData,
}: {
    data: z.infer<typeof schema>[]
}) {
    const [data, setData] = React.useState(() => initialData)
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id) || [],
        [data]
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const router = useRouter()

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    return (
        <Tabs defaultValue="citas" className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-end px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    Vista
                </Label>
                <div className="flex items-center gap-2 ">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <IconLayoutColumns />
                                <span className="hidden lg:inline">Personalizar columnas</span>
                                <span className="lg:hidden">Columnas</span>
                                <IconChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id === "appointment_time" ? "Fecha y Hora" :
                                                column.id === "status" ? "Estado" :
                                                    column.id === "created_at" ? "Creado el" :
                                                        column.id === "user_id" ? "Usuario" :
                                                            column.id === "vehicle_id" ? "Vehículo" : column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/appointments/new")}>
                        <IconPlus />
                        <span className="hidden lg:inline">Nueva cita</span>
                    </Button>
                </div>
            </div>
            <TabsContent
                value="citas"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <div className="overflow-hidden rounded-lg border">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className="bg-muted sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {table.getRowModel().rows?.length ? (
                                    <SortableContext
                                        items={dataIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow key={row.id} row={row} />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No se encontraron citas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} de{" "}
                        {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Filas por página
                            </Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                    <SelectValue
                                        placeholder={table.getState().pagination.pageSize}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Página {table.getState().pagination.pageIndex + 1} de{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Ir a la primera página</span>
                                <IconChevronsLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Ir a la página anterior</span>
                                <IconChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Ir a la página siguiente</span>
                                <IconChevronRight />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Ir a la última página</span>
                                <IconChevronsRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="historial" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent value="vehiculos" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs>
    )
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
    const isMobile = useIsMobile()

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground w-fit px-0 text-left">
                    Cita #{item.id}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>Detalles de la cita</DrawerTitle>
                    <DrawerDescription>
                        Programada para el {format(new Date(item.appointment_time), "PPP", { locale: es })} a las {format(new Date(item.appointment_time), "p", { locale: es })}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="appointment_time">Fecha y Hora</Label>
                            <Input
                                id="appointment_time"
                                defaultValue={format(new Date(item.appointment_time), "yyyy-MM-dd'T'HH:mm")}
                                type="datetime-local"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="status">Estado</Label>
                            <Select defaultValue={item.status}>
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente">Pendiente</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="completado">Completado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="user_id">ID de Usuario</Label>
                            <Input id="user_id" defaultValue={item.user_id} readOnly />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="vehicle_id">ID de Vehículo</Label>
                            <Input id="vehicle_id" defaultValue={item.vehicle_id} />
                        </div>
                    </form>
                </div>
                <DrawerFooter>
                    <Button>Guardar cambios</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}