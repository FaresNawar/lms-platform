import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import CourseCard from '../components/CourseCard'

export default function Dashboard() {
    const { profile } = useAuth()
    const [courses, setCourses] = useState(null)
    const isStudent = profile.role === 'student'

    useEffect(() => {
        if (isStudent) api('/api/my-courses').then(setCourses).catch(() => setCourses([]))
    }, [isStudent])

    return (
        <>
            <h1 className="text-2xl font-bold">Hi, {profile.name}</h1>

            {!isStudent && <p className="mt-4 text-slate-400">Instructor tools are coming soon.</p>}

            {isStudent && (
                <>
                    <h2 className="mb-4 mt-8 text-lg font-semibold text-slate-300">My courses</h2>
                    {courses === null ? (
                        <p className="text-slate-400">Loading…</p>
                    ) : courses.length === 0 ? (
                        <p className="text-slate-400">
                            You haven't enrolled in anything yet.{' '}
                            <Link to="/courses" className="text-emerald-400 hover:underline">
                                Browse the catalog
                            </Link>
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {courses.map((c) => (
                                <CourseCard key={c.id} course={c} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    )
}