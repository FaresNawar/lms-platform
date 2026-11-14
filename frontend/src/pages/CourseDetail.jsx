import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function CourseDetail() {
    const { id } = useParams()
    const { profile } = useAuth()
    const [course, setCourse] = useState(null)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        api(`/api/courses/${id}`).then(setCourse).catch((e) => setError(e.message))
    }, [id])

    async function enroll() {
        setBusy(true)
        try {
            await api(`/api/courses/${id}/enroll`, { method: 'POST' })
            setCourse({ ...course, enrolled: true, can_open: true })
        } catch (e) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    async function unenroll() {
        if (!window.confirm('Unenroll from this course? Your submissions are kept.')) return
        setBusy(true)
        try {
            await api(`/api/courses/${id}/enroll`, { method: 'DELETE' })
            setCourse({ ...course, enrolled: false, can_open: false })
        } catch (e) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    if (error) return <p className="text-red-400">{error}</p>
    if (!course) return <p className="text-slate-400">Loading…</p>

    return (
        <>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Taught by {course.instructor}</p>
            <p className="mt-4 max-w-2xl text-slate-300">{course.description}</p>

            {profile.role === 'student' &&
                (course.enrolled ? (
                    <div className="mt-6 flex items-center gap-4">
                        <p className="text-emerald-400">You're enrolled in this course ✓</p>
                        <button
                            onClick={unenroll}
                            disabled={busy}
                            className="text-sm text-slate-500 underline hover:text-red-400 disabled:opacity-50"
                        >
                            Unenroll
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={enroll}
                        disabled={busy}
                        className="mt-6 rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
                    >
                        {busy ? 'Enrolling…' : 'Enroll'}
                    </button>
                ))}

            <h2 className="mb-3 mt-10 text-xl font-semibold">Syllabus</h2>
            <ol className="space-y-2">
                {course.lessons.map((l, i) => (
                    <li key={l.id}>
                        {course.can_open ? (
                            <Link
                                to={`/lessons/${l.id}`}
                                className="block rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 hover:border-emerald-400"
                            >
                                <span className="mr-3 text-slate-500">{i + 1}.</span>
                                {l.title}
                            </Link>
                        ) : (
                            <div className="rounded-lg border border-slate-800 bg-slate-800/50 px-4 py-3 text-slate-500">
                                <span className="mr-3">{i + 1}.</span>
                                {l.title}
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </>
    )
}