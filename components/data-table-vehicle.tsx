"use client"
import { useState, useId, useMemo } from "react"
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
    IconDotsVertical,
    IconGripVertical,
    IconLoader,
    IconPlus,
    IconUser,
    IconTrash,
    IconSearch
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
import { toast } from "sonner"
import { z } from "zod"
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PaginationControls } from "@/components/pagination-controls"
import { API_URL } from "@/config/config";
import { getCsrfToken } from "@/lib/getcrfstoken"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export const schema = z.object({
    plate: z.string(),
    brand: z.string(),
    model: z.string(),
    color: z.string(),
    vehicle_type: z.string(),
    owner_id: z.string().uuid(),
})

export type Vehicle = z.infer<typeof schema>;

interface DataTableProps {
    data: Vehicle[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    searchTerm?: string;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    setPageIndex?: (pageIndex: number) => void;
    setSearchTerm?: (term: string) => void;
}

const ActionsCell = ({
    row,
}: {
    row: Row<z.infer<typeof schema>>;
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleEdit = () => {
        // Abrir modal de edición con los datos actuales
        toast.info(`Editando vehículo ${row.original.plate}`)
    }

    const handleDelete = async () => {
        setIsProcessing(true)
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${API_URL}/vehicles/${row.original.plate}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include'
            })

            if (!response.ok) throw new Error(await response.text())

            toast.success(`Vehículo ${row.original.plate} eliminado correctamente`)
            return true
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al eliminar vehículo')
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
                    <DropdownMenuItem onClick={handleEdit}>
                        <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <div className="flex items-center gap-2">
                            <IconTrash className="h-4 w-4" />
                            <span>Eliminar</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Diálogo de confirmación para eliminar */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar el vehículo con placa {row.original.plate}? Esta acción no se puede deshacer.
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
                            onClick={handleDelete}
                            disabled={isProcessing}
                            variant="destructive"
                        >
                            {isProcessing ? (
                                <IconLoader className="h-4 w-4 animate-spin" />
                            ) : (
                                <span>Eliminar</span>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

function DragHandle({ id }: { id: string }) {
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
        cell: ({ row }) => <DragHandle id={row.original.plate} />,
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
        accessorKey: "plate",
        header: "Placa",
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.plate}
            </div>
        ),
    },
    {
        accessorKey: "brand",
        header: "Marca",
        cell: ({ row }) => row.original.brand,
    },
    {
        accessorKey: "model",
        header: "Modelo",
        cell: ({ row }) => row.original.model,
    },
    {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => {
            const colorMap = {
                rojo: "#ef4444",
                azul: "#3b82f6",
                verde: "#22c55e",
                amarillo: "#eab308",
                negro: "#000000",
                blanco: "#ffffff",
                gris: "#6b7280",
                marron: "#78350f",
                naranja: "#f97316",
                otro: "linear-gradient(to right, #a855f7, #ec4899)"
            };

            const colorName = row.original.color.toLowerCase();
            const isKnownColor = colorName in colorMap;
            const isOther = colorName === "otro";
            const isUnknown = !isKnownColor;

            // Obtener el valor del color
            const colorValue = isKnownColor ? colorMap[colorName as keyof typeof colorMap] : colorMap.otro;

            return (
                <div className="flex items-center gap-2">
                    <div
                        className="size-4 rounded-full border"
                        style={isOther || isUnknown ? {
                            background: colorMap.otro,
                            backgroundColor: "transparent"
                        } : {
                            backgroundColor: colorValue
                        }}
                    />
                    <span className="capitalize">
                        {isKnownColor ? colorName : `${colorName} (otro)`}
                    </span>
                </div>
            );
        }
    },
    {
        accessorKey: "vehicle_type",
        header: "Tipo",
        cell: ({ row }) => {
            const type = row.original.vehicle_type;
            const typeLabels: Record<string, string> = {
                coche: "Coche",
                moto: "Motocicleta",
                camion: "Camión",
                otro: "Otro"
            };

            return typeLabels[type] || type;
        }
    },
    {
        accessorKey: "owner_id",
        header: "Dueño",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <IconUser className="size-4" />
                {row.original.owner_id.substring(0, 8)}...
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
        id: row.original.plate,
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
    data: data,
    totalCount,
    pageIndex,
    pageSize,
    searchTerm,
    onPageChange,
    onPageSizeChange,
    setPageIndex,
    setSearchTerm

}: DataTableProps) {
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

    const dataIds = useMemo<UniqueIdentifier[]>(
        () => data?.map(({ plate }) => plate) || [],
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
        getRowId: (row) => row.plate,
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

    return (
        <Tabs defaultValue="citas" className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-end px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    Vista
                </Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    <div className="w-full sm:flex-1 min-w-0"> {/* min-w-0 evita desbordamiento */}
                        <div className="relative w-full">
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar vehículo por numero de placa..."
                                value={searchTerm}
                                onChange={(e) => {
                                    if (setSearchTerm) setSearchTerm(e.target.value)
                                    if (setPageIndex) setPageIndex(0) // Resetear a primera página al buscar
                                }}
                                className="w-full pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-auto flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/vehicles/new")}>
                            <IconPlus />
                            <span className="hidden lg:inline">Nuevo vehiculo</span>
                        </Button>
                    </div>

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
                                            No se encontraron vehiculos.
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
                    entityName="vehículos"
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
        </Tabs>
    )
}