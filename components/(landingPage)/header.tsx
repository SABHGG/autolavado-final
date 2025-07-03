import Link from 'next/link'

export default function Header() {
    return (
        <header className="py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary">AutoLavado Exprés</h1>
            </div>
            <nav>
                <ul className="flex space-x-4">
                    <li><Link href="#servicios" className="text-muted-foreground hover:text-primary">Servicios</Link></li>
                    <li><Link href="#por-que-nosotros" className="text-muted-foreground hover:text-primary">Por qué elegirnos</Link></li>
                    <li><Link href="#cita" className="text-muted-foreground hover:text-primary">Reservar cita</Link></li>
                    <li><Link href="/login" className=''>Ingresar</Link></li>
                    <li><Link href="/register" className=''>Registrar</Link></li>
                </ul>
            </nav>
        </header>
    )
}