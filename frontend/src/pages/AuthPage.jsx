import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const input =
    'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none'

function friendly(err) {
    const map = {
        'auth/invalid-credential': 'Wrong email or password.',
        'auth/email-already-in-use': 'That email is already registered.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'That email address looks invalid.',
        'auth/too-many-requests': 'Too many attempts. Try again in a bit.',
    }
    return map[err.code] || err.message || 'Something went wrong.'
}

export default function AuthPage({ mode }) {
    const isSignup = mode === 'signup'
    const { login, signup } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setBusy(true)
        try {
            if (isSignup) await signup(form)
            else await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            setError(friendly(err))
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 text-slate-100">
            <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-slate-800 p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-emerald-400">
                    {isSignup ? 'Create your account' : 'Welcome back'}
                </h1>

                {isSignup && (
                    <>
                        <input className={input} placeholder="Full name" value={form.name} onChange={set('name')} required />
                        <div className="grid grid-cols-2 gap-2">
                            {['student', 'instructor'].map((r) => (
                                <button
                                    type="button"
                                    key={r}
                                    onClick={() => setForm({ ...form, role: r })}
                                    className={`rounded-lg border px-3 py-2 capitalize ${form.role === r
                                            ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                                            : 'border-slate-700 text-slate-400'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <input className={input} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
                <input className={input} type="password" placeholder="Password" value={form.password} onChange={set('password')} required />

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                    disabled={busy}
                    className="w-full rounded-lg bg-emerald-500 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
                >
                    {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
                </button>

                <p className="text-center text-sm text-slate-400">
                    {isSignup ? 'Already have an account? ' : 'New here? '}
                    <Link className="text-emerald-400 hover:underline" to={isSignup ? '/login' : '/signup'}>
                        {isSignup ? 'Log in' : 'Sign up'}
                    </Link>
                </p>
            </form>
        </div>
    )
}