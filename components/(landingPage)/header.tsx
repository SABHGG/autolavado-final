'use client'
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // Iconos (puedes cambiar si usas otro set)

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center">
                <Link href="/" className="mr-4">
                    <h1 className="text-2xl font-bold text-primary">HARDSOFT</h1>
                </Link>

            </div>

            {/* Botón del menú hamburguesa (solo visible en móviles) */}
            <button
                className="md:hidden text-gray-600 hover:text-primary focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Menú en pantallas grandes */}
            <nav className="hidden md:block">
                <ul className="flex space-x-4">
                    <li><Link href="/#servicios" className=" hover:text-primary">Servicios</Link></li>
                    <li><Link href="/#por-que-nosotros" className=" hover:text-primary">Por qué elegirnos</Link></li>
                    <li><Link href="/#cita" className=" hover:text-primary">Reservar cita</Link></li>
                    <li><Link href="/login" className="">Ingresar</Link></li>
                    <li><Link href="/register" className="">Registrar</Link></li>
                </ul>
            </nav>

            {/* Menú desplegable para móviles */}
            {isOpen && (
                <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden z-50">
                    <ul className="flex flex-col space-y-4 p-4">
                        <li><Link href="/#servicios" onClick={() => setIsOpen(false)} className=" hover:text-primary">Servicios</Link></li>
                        <li><Link href="/#por-que-nosotros" onClick={() => setIsOpen(false)} className=" hover:text-primary">Por qué elegirnos</Link></li>
                        <li><Link href="/#cita" onClick={() => setIsOpen(false)} className="hover:text-primary">Reservar cita</Link></li>
                        <li><Link href="/login" onClick={() => setIsOpen(false)} className="">Ingresar</Link></li>
                        <li><Link href="/register" onClick={() => setIsOpen(false)} className="">Registrar</Link></li>
                    </ul>
                </div>
            )}
        </header>
    );
}
