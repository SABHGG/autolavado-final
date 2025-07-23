"use client";
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table-appointments';
import { Appointment } from '@/types/types';
import { API_URL } from "@/config/config";
import { IconLoader } from '@tabler/icons-react';
import { toast } from "sonner"

const AppointmentsPage = () => {
    const [data, setData] = useState<Appointment[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            const toastId = "loading-appointments";
            try {
                toast.loading("Cargando citas...", {
                    id: toastId,
                });
                const params = new URLSearchParams({
                    offset: String(pageIndex * pageSize),
                    limit: String(pageSize),
                    ...(statusFilter && { status: statusFilter })
                });

                const response = await fetch(`${API_URL}/appointments?${params.toString()}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const result = await response.json();

                // Handle both array-only and {data, total} response formats
                if (Array.isArray(result)) {
                    setData(result);
                    setTotalCount(result.length);
                    toast.success(`Mostrando ${result.length} citas`, {
                        id: toastId
                    });
                } else if (result.data && typeof result.total === 'number') {
                    setData(result.data);
                    setTotalCount(result.total);
                    toast.success(
                        result.data.length > 0
                            ? `Mostrando ${result.data.length} de ${result.total} citas`
                            : "No se encontraron citas con estos filtros",
                        {
                            id: toastId,
                            duration: result.data.length > 0 ? 3000 : 5000
                        }
                    );
                } else {
                    throw new Error('Unexpected API response format');
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setData([]);
                setTotalCount(0);
                toast.error(
                    error instanceof Error
                        ? `Error al cargar citas: ${error.message}`
                        : "Ocurrió un error desconocido al cargar las citas",
                    {
                        id: toastId,
                        duration: 5000
                    }
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [pageIndex, pageSize, statusFilter]);

    if (loading && data.length === 0) {
        return <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <div className="flex items-center justify-center h-64">
                <IconLoader className="animate-spin h-8 w-8" />
            </div>
        </div>;
    }

    const mappedData = Array.isArray(data) && data.length > 0
        ? data.map((item) => ({
            ...item,
            id: Number(item.id), // convierte de string a number
        }))
        : [];

    return (
        <DataTable
            data={mappedData}
            totalCount={totalCount}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            onStatusFilterChange={setStatusFilter}
            pageIndex={pageIndex}
            pageSize={pageSize}
        />
    );
}

export default AppointmentsPage;