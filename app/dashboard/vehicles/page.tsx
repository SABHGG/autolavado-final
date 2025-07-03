"use client";
import { API_URL } from '@/config/config';
import { Vehicle } from '@/types/types';
import { useState, useEffect } from 'react'
import { VehiclesTable } from '@/components/data-table-vehicle';

const VehiclePage = () => {
    const [data, setData] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/vehicles/`,
            {
                method: 'GET',
                credentials: 'include'
            }
        )
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => {
                console.error('Error fetching appointments:', error);
                setData([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />;
    }

    return (
        <VehiclesTable
            data={data
                .filter(vehicle => typeof vehicle.id === 'string')
                .map(vehicle => ({
                    ...vehicle,
                    id: vehicle.id as string,
                }))
            }
        />
    );
}

export default VehiclePage