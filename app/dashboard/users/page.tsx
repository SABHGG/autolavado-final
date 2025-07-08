"use client";
import { API_URL } from '@/config/config';
import { User } from '@/types/types';
import { useState, useEffect } from 'react'
import { UsersTable } from '@/components/data-table-user';

const UserPage = () => {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/users/`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    // Manejar diferentes códigos de estado
                    if (response.status === 403) {
                        throw new Error('No tienes permisos para acceder a este recurso');
                    } else if (response.status === 404) {
                        throw new Error('Recurso no encontrado');
                    } else {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                setError(error.message);
                setData([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p>Error al cargar los usuarios: {error}</p>
                <button
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        // Volver a cargar los datos
                        fetch(`${API_URL}/users/`, {
                            method: 'GET',
                            credentials: 'include'
                        }).then(response => {
                            if (!response.ok) {
                                if (response.status === 403) {
                                    throw new Error('No tienes permisos para acceder a este recurso');
                                } else if (response.status === 404) {
                                    throw new Error('Recurso no encontrado');
                                } else {
                                    throw new Error(`Error HTTP: ${response.status}`);
                                }
                            }
                            return response.json();
                        })
                            .then(data => {
                                setData(data);
                                setError(null);
                            })
                            .catch(error => {
                                console.error('Error fetching users:', error);
                                setError(error.message);
                                setData([]);
                            })
                            .finally(() => setLoading(false));
                    }}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <UsersTable
            data={data}
        />
    )
}

export default UserPage