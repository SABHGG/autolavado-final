"use client"
import { useEffect, useState } from "react"
import { API_URL } from "@/config/config"
import { SectionCards } from "@/components/section-cards"

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    appointments_today: 0,
    income_today: 0,
    most_requested_service: {
      name: "",
      count: 0
    }
  })

  useEffect(() => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
    fetch(`${API_URL}/reports/dashboard`, {
      method: 'GET',
      credentials: 'include'
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      setData(data);

      setLoading(false);
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    })
  }, [])

  return (
    <>
      {loading ? (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
        </>
      ) : (
        <SectionCards
          appointments_today={data.appointments_today}
          income_today={data.income_today}
          most_requested_service={data.most_requested_service}
        />
      )}
    </>
  )
}
