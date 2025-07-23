"use client";
import { API_URL } from '@/config/config';
import { Service } from '@/types/types';
import { useState, useEffect } from 'react'
import { ServicesTable } from '@/components/data-table-services';
import { IconLoader } from '@tabler/icons-react';
import { toast } from 'sonner';

const ServicePage = () => {
    const [data, setData] = useState<Service[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            const toastId = "loading-services";
            try {
                toast.loading("Cargando servicios", {
                    id: toastId,
                });
                const params = new URLSearchParams({
                    offset: String(pageIndex * pageSize),
                    limit: String(pageSize)
                });

                const response = await fetch(`${API_URL}/services?${params.toString()}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }

                const result = await response.json();

                // Handle both array-only and {data, total} response formats
                if (Array.isArray(result)) {
                    setData(result);
                    setTotalCount(result.length);
                    toast.success(`Mostrando ${result.length} servicios`, {
                        id: toastId
                    });
                } else if (result.data && typeof result.total === 'number') {
                    setData(result.data);
                    setTotalCount(result.total);
                    toast.success(
                        result.data.length > 0
                            ? `Mostrando ${result.data.length} de ${result.total} servicios`
                            : "No se encontraron servicios con estos filtros",
                        {
                            id: toastId,
                            duration: result.data.length > 0 ? 3000 : 5000
                        }
                    );
                } else {
                    throw new Error('Unexpected API response format');
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                setData([]);
                setTotalCount(0);
                toast.error(
                    error instanceof Error
                        ? `Error al cargar los servicios: ${error.message}`
                        : "Ocurrió un error desconocido al cargar los servicios",
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
    }, [pageIndex, pageSize]);

    if (loading && data.length === 0) {
        return <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <div className="flex items-center justify-center h-64">
                <IconLoader className="animate-spin h-8 w-8" />
            </div>
        </div>;
    }

    const mappedData = Array.isArray(data) ? data : [];

    return (
        <ServicesTable
            data={mappedData}
            totalCount={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            setData={setData}
        />
    )
}

export default ServicePage