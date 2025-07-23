// components/pagination-controls.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"

interface PaginationControlsProps {
    pageIndex: number
    pageSize: number
    totalCount: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange: (pageSize: number) => void
    entityName?: string // Opcional: "citas", "usuarios", etc.
}

export function PaginationControls({
    pageIndex,
    pageSize,
    totalCount,
    onPageChange,
    onPageSizeChange,
    entityName = "registros"
}: PaginationControlsProps) {
    const pageCount = Math.ceil(totalCount / pageSize)
    const showingText = `Mostrando ${pageIndex * pageSize + 1}-${Math.min(
        (pageIndex + 1) * pageSize,
        totalCount
    )} de ${totalCount} ${entityName}`

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2">
            {/* Info de registros */}
            <div className="text-muted-foreground text-xs sm:text-sm">
                {showingText}
            </div>

            {/* Controles de navegación */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Versión móvil */}
                <div className="flex sm:hidden items-center gap-1 w-full justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pageIndex - 1)}
                        disabled={pageIndex === 0}
                        className="h-8 w-8 p-0"
                    >
                        <IconChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs px-1">
                        {pageIndex + 1}/{pageCount}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pageIndex + 1)}
                        disabled={pageIndex >= pageCount - 1}
                        className="h-8 w-8 p-0"
                    >
                        <IconChevronRight className="h-3 w-3" />
                    </Button>
                </div>

                {/* Versión desktop */}
                <div className="hidden sm:flex items-center gap-1">
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            onPageSizeChange(Number(value))
                            onPageChange(0)
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 30].map((size) => (
                                <SelectItem key={size} value={`${size}`} className="text-xs">
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(0)}
                        disabled={pageIndex === 0}
                        className="h-8 w-8 p-0"
                    >
                        <IconChevronsLeft className="h-3 w-3" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pageIndex - 1)}
                        disabled={pageIndex === 0}
                        className="h-8 w-8 p-0"
                    >
                        <IconChevronLeft className="h-3 w-3" />
                    </Button>

                    <span className="text-xs px-1">
                        Pág. {pageIndex + 1} de {pageCount}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pageIndex + 1)}
                        disabled={pageIndex >= pageCount - 1}
                        className="h-8 w-8 p-0"
                    >
                        <IconChevronRight className="h-3 w-3" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pageCount - 1)}
                        disabled={pageIndex >= pageCount - 1}
                        className="h-8 w-8 p-0"
                    >
                        <IconChevronsRight className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}