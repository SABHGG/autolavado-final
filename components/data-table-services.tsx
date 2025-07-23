"use client"
import { useState, useId, useMemo, useEffect, useCallback, Dispatch, SetStateAction } from "react"
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
    IconCheck,
    IconDotsVertical,
    IconGripVertical,
    IconPlus,
    IconPower,
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
import { PaginationControls } from "@/components/pagination-controls"
import { RowData } from '@tanstack/table-core';
import { API_URL } from "@/config/config";
import { getCsrfToken } from "@/lib/getcrfstoken"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

export const schema = z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    description: z.string(),
    duration: z.number(),
    is_active: z.boolean()
})

type Service = z.infer<typeof schema>;
interface DataTableProps {
    data: Service[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    setData: Dispatch<SetStateAction<Service[]>>;
}

declare module '@tanstack/table-core' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: keyof TData, value: TData[keyof TData]) => void
    }
}

const ActionsCell = ({
    row,
    table,
}: {
    row: Row<z.infer<typeof schema>>;
    table: ReturnType<typeof useReactTable<z.infer<typeof schema>>>;
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const service = row.original;

    const toggleActiveStatus = async () => {
        setIsProcessing(true);
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch(`${API_URL}/services/${service.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify({
                    is_active: !service.is_active
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            table.options.meta?.updateData(row.index, 'is_active', !service.is_active);

            toast.success(
                `Servicio ${service.name} ${!service.is_active ? 'activado' : 'desactivado'} correctamente`
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : `Error al ${service.is_active ? 'desactivar' : 'activar'} servicio`
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {/* Switch para activar/desactivar */}
            <div className="flex items-center gap-2">
                <Switch
                    checked={service.is_active}
                    onCheckedChange={toggleActiveStatus}
                    disabled={isProcessing}
                />
                <span className="text-sm font-medium">
                    {service.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {/* Menú de acciones adicionales */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isProcessing}>
                        <IconDotsVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleActiveStatus}>
                        <div className="flex items-center gap-2">
                            {service.is_active ? (
                                <IconPower className="h-4 w-4 text-yellow-500" />
                            ) : (
                                <IconCheck className="h-4 w-4 text-green-500" />
                            )}
                            <span>{service.is_active ? 'Desactivar' : 'Activar'}</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

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
        cell: ({ row }) => <DragHandle id={row.original.id.toString()} />,
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
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => row.original.name,
    },
    {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => (
            <div className="font-medium">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(row.original.price)}
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: "Descripción",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate">
                {row.original.description}
            </div>
        ),
    },
    {
        accessorKey: "duration",
        header: "Duración",
        cell: ({ row }) => row.original.duration,
    },
    {
        accessorKey: "is_active",
        header: "Servicio Activo",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                {row.original.is_active ? (
                    <>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Activo</span>
                    </>
                ) : (
                    <>
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span>Inactivo</span>
                    </>
                )}
            </div>
        ),
        // Optional: Add sorting/filtering capabilities
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        }
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

export function ServicesTable({
    data,
    totalCount,
    pageIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setData
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

    useEffect(() => {
        setPagination({ pageIndex, pageSize });
    }, [pageIndex, pageSize]);

    const dataIds = useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id) || [],
        [data]
    )

    const updateData = useCallback(
        (rowIndex: number, columnId: keyof Service, value: Service[keyof Service]) => {
            setData((prev: Service[]) =>
                prev.map((row, index) =>
                    index === rowIndex ? {
                        ...row,
                        [columnId]: value
                    } : row
                ) as Service[]
            );
        },
        [setData]
    );

    const table = useReactTable<Service>({
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
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newPagination = updater(pagination);
                onPageChange(newPagination.pageIndex);
                onPageSizeChange(newPagination.pageSize);
                setPagination(newPagination);
            }
        },
        meta: {
            updateData,
        },
    })

    const router = useRouter()

    return (
        <Tabs defaultValue="servicios" className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-end px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    Vista
                </Label>
                <div className="flex items-center gap-2 ">
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/services/new")}>
                        <IconPlus />
                        <span className="hidden lg:inline">Nuevo servicio</span>
                    </Button>
                </div>
            </div>
            <TabsContent
                value="servicios"
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
                                            No se encontraron servicios.
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
                    entityName="servicios"
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
