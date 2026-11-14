import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useIsDesktop } from '../lib/useIsDesktop'
import { useRunner } from '../lib/useRunner'
import CodeEditor from '../components/CodeEditor'
import Output from '../components/Output'

// `flush` panes (editor, web preview) fill the whole pane with no padding.
// The absolute-inset trick gives children a guaranteed height to fill.
function Pane({ title, actions, flush = false, children }) {
    return (
        <section className="flex h-full min-h-[24rem] flex-col border-b border-slate-800 lg:min-h-0 lg:border-b-0">
            <h2 className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>{title}</span>
                {actions}
            </h2>
            <div className={`relative min-h-0 flex-1 ${flush ? '' : 'overflow-auto p-4'}`}>
                {flush ? <div className="absolute inset-0">{children}</div> : children}
            </div>
        </section>
    )
}

function Handle() {
    return (
        <PanelResizeHandle className="w-1 bg-slate-800 transition-colors hover:bg-emerald-400 data-[resize-handle-state=drag]:bg-emerald-400" />
    )
}

function LessonView({ id }) {
    const { profile } = useAuth()
    const isDesktop = useIsDesktop()
    const [lesson, setLesson] = useState(null)
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [webRun, setWebRun] = useState(null) // { id, code } for the live preview
    const runner = useRunner(lesson?.course.language)

    // Drafts are saved per user AND per assignment, so two people sharing
    // a browser never see each other's work.
    const draftKey = (assignmentId) => `draft:${profile.id}:${assignmentId}`

    useEffect(() => {
        api(`/api/lessons/${id}`)
            .then((l) => {
                setLesson(l)
                const a = l.assignment
                if (a) setCode(localStorage.getItem(`draft:${profile.id}:${a.id}`) ?? a.starter_code ?? '')
            })
            .catch((e) => setError(e.message))
    }, [id, profile.id])

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
    const isWeb = lesson.course.language === 'web'
    const navBtn = 'rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800'

    function onCodeChange(value) {
        setCode(value)
        localStorage.setItem(draftKey(a.id), value)
    }

    function resetCode() {
        if (!window.confirm('Reset your code to the starter code? Your current draft will be lost.')) return
        localStorage.removeItem(draftKey(a.id))
        setCode(a.starter_code ?? '')
    }

    function run() {
        if (isWeb) setWebRun({ id: Date.now(), code })
        else runner.run(code)
    }

    const lessonPane = (
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
    )

    const editorPane = (
        <Pane
            title="Editor"
            flush
            actions={
                a && (
                    <span className="flex items-center gap-3 normal-case tracking-normal">
                        <button onClick={resetCode} className="text-slate-500 hover:text-slate-200">
                            Reset
                        </button>
                        {runner.running ? (
                            <button onClick={runner.stop} className="rounded bg-red-500 px-3 py-0.5 font-semibold text-white hover:bg-red-400">
                                Stop
                            </button>
                        ) : (
                            <button onClick={run} className="rounded bg-emerald-500 px-3 py-0.5 font-semibold text-slate-900 hover:bg-emerald-400">
                                ▶ Run
                            </button>
                        )}
                    </span>
                )
            }
        >
            {a ? (
                <CodeEditor value={code} onChange={onCodeChange} language={lesson.course.language} />
            ) : (
                <p className="p-4 text-sm text-slate-500">This lesson has no coding task.</p>
            )}
        </Pane>
    )

    const outputPane = (
        <Pane title="Output" flush={isWeb}>
            <Output
                isWeb={isWeb}
                webRun={webRun}
                lines={runner.lines}
                running={runner.running}
                pending={runner.pending}
                onInput={runner.submitInput}
            />
        </Pane>
    )

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

            {isDesktop ? (
                <div className="min-h-0 flex-1">
                    <PanelGroup direction="horizontal" autoSaveId="workspace-layout">
                        <Panel id="lesson" order={1} defaultSize={34} minSize={15} collapsible>
                            {lessonPane}
                        </Panel>
                        <Handle />
                        <Panel id="editor" order={2} defaultSize={38} minSize={20}>
                            {editorPane}
                        </Panel>
                        <Handle />
                        <Panel id="output" order={3} defaultSize={28} minSize={15} collapsible>
                            {outputPane}
                        </Panel>
                    </PanelGroup>
                </div>
            ) : (
                <div className="min-h-0 flex-1 overflow-auto">
                    {lessonPane}
                    {editorPane}
                    {outputPane}
                </div>
            )}
        </div>
    )
}

// Keying on the id remounts the page when you hit Next/Previous,
// so you never see the old lesson flash while the new one loads.
export default function Lesson() {
    const { id } = useParams()
    return <LessonView key={id} id={id} />
}