"use client";
import { API_URL } from '@/config/config';
import { Vehicle } from '@/types/types';
import { useState, useEffect } from 'react'
import { DataTable } from '@/components/data-table-vehicle';
import { IconLoader } from '@tabler/icons-react';
import { toast } from 'sonner';

const VehiclePage = () => {
    const [data, setData] = useState<Vehicle[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            const toastId = "loading-vehicles";
            try {
                toast.loading("Cargando vehiculos", {
                    id: toastId,
                });
                const params = new URLSearchParams({
                    offset: String(pageIndex * pageSize),
                    limit: String(pageSize),
                    ...(searchTerm && { search: searchTerm })
                });

                const response = await fetch(`${API_URL}/vehicles?${params.toString()}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const result = await response.json();

                if (Array.isArray(result)) {
                    setData(result);
                    setTotalCount(result.length);
                    toast.success(`Mostrando ${result.length} vehiculos`, {
                        id: toastId
                    });
                } else if (result.data && typeof result.total === 'number') {
                    setData(result.data);
                    setTotalCount(result.total);
                    toast.success(
                        result.data.length > 0
                            ? `Mostrando ${result.data.length} de ${result.total} vehiculos`
                            : "No se encontraron vehiculos con estos filtros",
                        {
                            id: toastId,
                            duration: result.data.length > 0 ? 3000 : 5000
                        }
                    );
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (error) {
                console.error('Error fetching vechicles:', error);
                setData([]);
                setTotalCount(0);
                toast.error(
                    error instanceof Error
                        ? `Error al cargar los vehiculos: ${error.message}`
                        : "Ocurrió un error desconocido al cargar los vehiculos",
                    {
                        id: toastId,
                        duration: 5000
                    }
                );
            } finally {
                setLoading(false);
            }
        };

        // Debounce para la búsqueda
        const timer = setTimeout(() => {
            fetchVehicles();
        }, 300);

        return () => clearTimeout(timer);
    }, [pageIndex, pageSize, searchTerm]);

    if (loading && data.length === 0) {
        return <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <div className="flex items-center justify-center h-64">
                <IconLoader className="animate-spin h-8 w-8" />
            </div>
        </div>;
    }

    const mappedData = Array.isArray(data) ? data : [];

    return (
        <DataTable
            data={mappedData}
            totalCount={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            searchTerm={searchTerm}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            setSearchTerm={setSearchTerm}
            setPageIndex={setPageIndex}
        />
    );
}

export default VehiclePage