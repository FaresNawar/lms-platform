import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { profile, logout } = useAuth()

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
            <div className="space-y-2 rounded-xl bg-slate-800 p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-emerald-400">Hi, {profile.name}</h1>
                <p className="text-slate-400">
                    {profile.email} · <span className="capitalize">{profile.role}</span>
                </p>
                <button onClick={logout} className="mt-4 rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-700">
                    Log out
                </button>
            </div>
        </div>
    )
}