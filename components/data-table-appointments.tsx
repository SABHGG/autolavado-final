"use client"
import { useState, useEffect, useMemo, useId, cloneElement } from "react"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    IconCalendar,
    IconCar,
    IconCircleCheckFilled,
    IconXboxXFilled,
    IconClock,
    IconDotsVertical,
    IconGripVertical,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { PaginationControls } from "@/components/pagination-controls"
import { API_URL } from "@/config/config";
import { User } from "@/types/types"
import { fetchEmployees } from "@/services/employees"
import { getCsrfToken } from "@/lib/getcrfstoken"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export const schema = z.object({
    id: z.number(),
    appointment_time: z.string().datetime(),
    status: z.string(),
    user_id: z.string().uuid(),
    vehicle_id: z.string(),
})

type Appointment = z.infer<typeof schema>;

interface DataTableProps {
    data: Appointment[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onStatusFilterChange: (status: string | undefined) => void;
}

const ActionsCell = ({
    row,
}: {
    row: Row<z.infer<typeof schema>>;
}) => {
    const { user } = useAuth()
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
    const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
    const [employees, setEmployees] = useState<User[]>([])
    const [selectedEmployee, setSelectedEmployee] = useState("")
    const [newAppointmentTime, setNewAppointmentTime] = useState(
        new Date(row.original.appointment_time)
    )
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (isAssignDialogOpen && employees.length === 0) {
            const loadEmployees = async () => {
                setIsLoadingEmployees(true)
                try {
                    const fetchedEmployees = await fetchEmployees()
                    setEmployees(fetchedEmployees)
                } catch {
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

    const formatForBackend = (date: Date) => {
        return date.toISOString().replace('Z', '')
    }

    const handleEdit = () => {
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
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({
                    employee_id: selectedEmployee
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
                    }).filter(([, v]) => v !== undefined)
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
                        }).filter(([, v]) => v !== undefined)
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
                                                {Array.from({ length: 24 }, (_, i) => {
                                                    const hour = 0 + i
                                                    return [`${hour}:00`, `${hour}:30`]
                                                })
                                                    .flat()
                                                    .map((time) => (
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

            // Configuración centralizada de estilos
            const statusConfig = {
                pendiente: {
                    label: "Pendiente",
                    icon: <IconClock className="mr-1.5 size-3.5" />,
                    variant: "outline",
                    class: "border-amber-300 text-amber-800 bg-amber-50",
                    iconClass: "text-amber-500"
                },
                en_progreso: {
                    label: "En progreso",
                    icon: <IconProgress className="mr-1.5 size-3.5 animate-pulse" />,
                    variant: "default",
                    class: "border-blue-300 text-blue-800 bg-blue-50",
                    iconClass: "text-blue-500"
                },
                completada: {
                    label: "Completada",
                    icon: <IconCircleCheckFilled className="mr-1.5 size-3.5" />,
                    variant: "default",
                    class: "border-emerald-300 text-emerald-800 bg-emerald-50",
                    iconClass: "text-emerald-500"
                },
                cancelada: {
                    label: "Cancelada",
                    icon: <IconXboxXFilled className="mr-1.5 size-3.5" />,
                    variant: "default",
                    class: "border-red-300 text-red-800 bg-red-50",
                    iconClass: "text-red-500"
                }
            } as const;

            const currentStatus = statusConfig[status] || {
                label: status,
                icon: null,
                variant: "outline",
                class: ""
            };

            return (
                <Badge
                    variant={currentStatus.variant as "outline" | "default"}
                    className={`inline-flex items-center py-1 ${currentStatus.class}`}
                    aria-label={`Estado: ${currentStatus.label}`}
                >
                    {cloneElement(currentStatus.icon, {
                        className: `${currentStatus.iconClass} ${currentStatus.icon.props.className || ''}`
                    })}
                    <span className="text-sm font-medium">{currentStatus.label}</span>
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
        id: "actions",
        cell: ActionsCell
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
    data,
    totalCount,
    pageIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onStatusFilterChange,
}: DataTableProps) {
    const { user } = useAuth()
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )


    useEffect(() => {
        setPagination({ pageIndex, pageSize });
    }, [pageIndex, pageSize]);

    const dataIds = useMemo<UniqueIdentifier[]>(
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
        manualPagination: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newPagination = updater(pagination);
                onPageChange(newPagination.pageIndex);
                onPageSizeChange(newPagination.pageSize);
                setPagination(newPagination);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        pageCount: Math.ceil(totalCount / pagination.pageSize),
    })

    const router = useRouter()

    return (
        <Tabs defaultValue="citas" className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-end px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    Vista
                </Label>
                <div className="flex items-center gap-2 ">
                    <Select
                        onValueChange={(value) => {
                            onStatusFilterChange(value === "all" ? undefined : value);
                            onPageChange(0);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_progreso">En progreso</SelectItem>
                            <SelectItem value="completada">Completada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={
                        user?.role === "admin" ? () => router.push("/dashboard/appointments/admin") : () => router.push("/dashboard/appointments/new")
                    }>
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
                <PaginationControls
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    entityName="citas"
                    onPageChange={(page) => {
                        table.setPageIndex(page)
                        onPageChange(page)
                    }}
                    onPageSizeChange={(size) => {
                        table.setPageSize(size)
                        onPageSizeChange(size)
                    }}
                />

            </TabsContent>
            <TabsContent value="historial" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
            <TabsContent value="vehiculos" className="flex flex-col px-4 lg:px-6">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs >
    )
}