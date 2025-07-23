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
    IconSearch,
    IconTrash
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
import { Input } from "./ui/input"

export const schema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string(),
    phone: z.string(),
    role: z.string(),
})

interface DataTableProps {
    data: z.infer<typeof schema>[];
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
        toast.info(`Editando usuario ${row.original.username}`)
    }

    const handleDelete = async () => {
        setIsProcessing(true)
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${API_URL}/users/${row.original.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include'
            })

            if (!response.ok) throw new Error(await response.text())

            toast.success(`Usuario ${row.original.username} eliminado correctamente`)
            return true
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al eliminar usuario')
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
                            ¿Estás seguro de eliminar el usuario {row.original.username}? Esta acción no se puede deshacer.
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
        accessorKey: "username",
        header: "Nombre de usuario",
        cell: ({ row }) => row.original.username,
    },
    {
        accessorKey: "email",
        header: "Correo electrónico",
        cell: ({ row }) => row.original.email,
    },
    {
        accessorKey: "phone",
        header: "Teléfono",
        cell: ({ row }) => row.original.phone,
    },
    {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => row.original.role,
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

export function UsersTable({
    data: data,
    totalCount,
    pageIndex,
    pageSize,
    searchTerm = '',
    onPageChange,
    onPageSizeChange,
    setSearchTerm,
    setPageIndex

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
        getRowId: (row) => row.id,
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
        <Tabs defaultValue="usuarios" className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-end px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    Vista
                </Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    {/* Barra de búsqueda - Ocupa todo el ancho en móvil */}
                    <div className="w-full sm:flex-1 min-w-0"> {/* min-w-0 evita desbordamiento */}
                        <div className="relative w-full">
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar usuarios por nombre o correo electrónico..."
                                value={searchTerm}
                                onChange={(e) => {
                                    if (setSearchTerm) setSearchTerm(e.target.value)
                                    if (setPageIndex) setPageIndex(0) // Resetear a primera página al buscar
                                }}
                                className="w-full pl-9 h-9 text-sm"
                            />
                        </div>
                    </div>

                    {/* Botón - Se ajusta automáticamente en desktop */}
                    <div className="w-full sm:w-auto flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/users/new")}
                            className="w-full sm:w-auto h-9"
                        >
                            <IconPlus className="mr-2 h-4 w-4" />
                            <span className="whitespace-nowrap">Nuevo usuario</span>
                        </Button>
                    </div>
                </div>
            </div>

            <TabsContent
                value="usuarios"
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
                                            No se encontraron usuarios.
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
                    entityName="usuarios"
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
        </Tabs>
    )
}