import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api'

function Pane({ title, children }) {
    return (
        <section className="flex min-h-[24rem] flex-col border-slate-800 lg:min-h-0 lg:border-r last:border-r-0">
            <h2 className="border-b border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {title}
            </h2>
            <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
        </section>
    )
}

function LessonView({ id }) {
    const [lesson, setLesson] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api(`/api/lessons/${id}`).then(setLesson).catch((e) => setError(e.message))
    }, [id])

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-900 text-slate-300">
                <p className="text-red-400">{error}</p>
                <Link to="/courses" className="text-emerald-400 hover:underline">
                    Back to catalog
                </Link>
            </div>
        )
    }

    if (!lesson) {
        return <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400">Loading…</div>
    }

    const a = lesson.assignment
    const navBtn = 'rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800'

    return (
        <div className="flex h-screen flex-col bg-slate-900 text-slate-100">
            <header className="flex items-center gap-4 border-b border-slate-800 px-4 py-2">
                <Link to={`/courses/${lesson.course.id}`} className="text-sm text-slate-400 hover:text-emerald-300">
                    ← {lesson.course.title}
                </Link>
                <span className="text-sm text-slate-500">
                    Lesson {lesson.position} of {lesson.total}
                </span>
                <div className="ml-auto flex gap-2">
                    {lesson.prev_id && <Link to={`/lessons/${lesson.prev_id}`} className={navBtn}>Previous</Link>}
                    {lesson.next_id && <Link to={`/lessons/${lesson.next_id}`} className={navBtn}>Next</Link>}
                </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-3 lg:overflow-hidden">
                <Pane title="Lesson">
                    {lesson.content_type === 'markdown' ? (
                        <article className="prose prose-invert max-w-none">
                            <ReactMarkdown>{lesson.content}</ReactMarkdown>
                        </article>
                    ) : (
                        <p className="text-slate-400">PDF lessons will be viewable here.</p>
                    )}

                    {a && (
                        <div className="mt-8 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                            <h3 className="font-semibold text-emerald-300">Task: {a.title}</h3>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{a.instructions}</p>
                            {a.requirements && (
                                <>
                                    <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</h4>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">{a.requirements}</p>
                                </>
                            )}
                        </div>
                    )}
                </Pane>

                <Pane title="Editor">
                    <pre className="font-mono text-sm text-slate-400">{a?.starter_code ?? '// No task for this lesson'}</pre>
                    <p className="mt-4 text-xs text-slate-600">The real code editor arrives in the next step.</p>
                </Pane>

                <Pane title="Output">
                    <p className="text-sm text-slate-500">Output will appear here once you can run code.</p>
                </Pane>
            </div>
        </div>
    )
}

// Keying on the id remounts the page when you hit Next/Previous,
// so you never see the old lesson flash while the new one loads.
export default function Lesson() {
    const { id } = useParams()
    return <LessonView key={id} id={id} />
}