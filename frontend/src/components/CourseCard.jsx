import { Link } from 'react-router-dom'

const labels = { web: 'Web', javascript: 'JavaScript', python: 'Python' }

export default function CourseCard({ course }) {
    return (
        <Link
            to={`/courses/${course.id}`}
            className="block rounded-xl border border-slate-700 bg-slate-800 p-5 transition hover:border-emerald-400"
        >
            <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                    {labels[course.language] ?? course.language}
                </span>
                {course.enrolled && <span className="text-xs text-slate-400">Enrolled ✓</span>}
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{course.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-400">{course.description}</p>
            <p className="mt-4 text-xs text-slate-500">
                {course.instructor} · {course.lessons_count} lessons
            </p>
        </Link>
    )
}