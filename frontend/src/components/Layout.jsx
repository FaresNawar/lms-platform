import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const link = ({ isActive }) =>
    `rounded-lg px-3 py-1 text-sm ${isActive ? 'bg-slate-700 text-emerald-300' : 'text-slate-400 hover:text-slate-100'}`

export default function Layout() {
    const { profile, logout } = useAuth()

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <header className="border-b border-slate-800">
                <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
                    <Link to="/dashboard" className="mr-4 text-lg font-bold text-emerald-400">
                        NCTU Learn
                    </Link>
                    <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
                    <NavLink to="/courses" className={link}>Catalog</NavLink>

                    <div className="ml-auto flex items-center gap-3 text-sm text-slate-400">
                        <span>
                            {profile.name} <span className="capitalize">({profile.role})</span>
                        </span>
                        <button onClick={logout} className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-800">
                            Log out
                        </button>
                    </div>
                </nav>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}