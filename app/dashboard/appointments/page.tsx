"use client";
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table';
import { Appointment } from '@/types/types'
import { API_URL } from "@/config/config";

const AppointmentsPage = () => {
    const [data, setData] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/appointments`,
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

    const mappedData = data
        .filter((item) => item.id !== undefined)
        .map((item) => ({
            ...item,
            id: Number(item.id),
            created_at: item.created_at ?? '', // Ensure created_at is always a string
        }));

    return (
        <DataTable data={mappedData} />
    );
}

export default AppointmentsPage