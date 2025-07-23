"use client";
import { API_URL } from '@/config/config';
import { User } from '@/types/types';
import { useState, useEffect } from 'react'
import { UsersTable } from '@/components/data-table-user';
import { Button } from '@/components/ui/button';
import { IconLoader } from '@tabler/icons-react';
import { toast } from 'sonner';

const UserPage = () => {
    const [data, setData] = useState<User[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const toastId = "loading-users";
            try {
                toast.loading("Cargando usuarios", {
                    id: toastId,
                });
                const params = new URLSearchParams({
                    offset: String(pageIndex * pageSize),
                    limit: String(pageSize),
                    ...(searchTerm && { search: searchTerm })
                });

                const response = await fetch(`${API_URL}/users/all?${params.toString()}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const result = await response.json();

                if (Array.isArray(result)) {
                    setData(result);
                    setTotalCount(result.length);
                    toast.success(`Mostrando ${result.length} usuarios`, {
                        id: toastId
                    });
                } else if (result.data && typeof result.total === 'number') {
                    setData(result.data);
                    setTotalCount(result.total);
                    toast.success(
                        result.data.length > 0
                            ? `Mostrando ${result.data.length} de ${result.total} usuarios`
                            : "No se encontraron usuarios con estos filtros",
                        {
                            id: toastId,
                            duration: result.data.length > 0 ? 3000 : 5000
                        }
                    );
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                setData([]);
                setTotalCount(0);
                toast.error(
                    error instanceof Error
                        ? `Error al cargar los usuarios: ${error.message}`
                        : "Ocurrió un error desconocido al cargar los usuarios",
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
            fetchUsers();
        }, 300);

        return () => clearTimeout(timer);
    }, [pageIndex, pageSize, searchTerm]);

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        setPageIndex(0); // Resetear a la primera página al reintentar
    };

    if (loading && data.length === 0) {
        return <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <div className="flex items-center justify-center h-64">
                <IconLoader className="animate-spin h-8 w-8" />
            </div>
        </div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>Error al cargar los usuarios: {error}</p>
                <Button
                    onClick={handleRetry}
                    variant="destructive"
                    className="mt-2"
                >
                    Reintentar
                </Button>
            </div>
        );
    }


    return (
        <UsersTable
            data={data}
            totalCount={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            searchTerm={searchTerm}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            setSearchTerm={setSearchTerm}
            setPageIndex={setPageIndex}
        />
    )
}

export default UserPage