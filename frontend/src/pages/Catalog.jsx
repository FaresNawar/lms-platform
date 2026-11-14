import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import CourseCard from '../components/CourseCard'

export default function Catalog() {
    const [courses, setCourses] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api('/api/courses').then(setCourses).catch((e) => setError(e.message))
    }, [])

    if (error) return <p className="text-red-400">{error}</p>
    if (!courses) return <p className="text-slate-400">Loading courses…</p>

    return (
        <>
            <h1 className="mb-6 text-2xl font-bold">Course catalog</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                ))}
            </div>
        </>
    )
}