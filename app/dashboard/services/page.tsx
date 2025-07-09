"use client";
import { API_URL } from '@/config/config';
import { Service } from '@/types/types';
import { useState, useEffect } from 'react'
import { ServicesTable } from '@/components/data-table-services';

const ServicePage = () => {
    const [data, setData] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/services`,
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
        <ServicesTable
            data={data.map(item => ({
                ...item,
                id: item.id ?? 0
            }))}
        />
    )
}

export default ServicePage