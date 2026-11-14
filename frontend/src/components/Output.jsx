import { useState } from 'react'

const colors = {
    log: 'text-slate-200',
    warn: 'text-amber-300',
    error: 'text-red-400',
    info: 'text-slate-500',
    input: 'text-emerald-300', // what the student typed
}

function InputLine({ prompt, onSubmit }) {
    const [value, setValue] = useState('')

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(value)
            }}
            className="flex items-center gap-2"
        >
            <span className="whitespace-pre text-emerald-300">{prompt}</span>
            <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label={prompt || 'Program input'}
                className="min-w-0 flex-1 border-b border-slate-600 bg-transparent text-slate-100 outline-none focus:border-emerald-400"
            />
        </form>
    )
}

export default function Output({ isWeb, webRun, lines, running, pending, onInput }) {
    if (isWeb) {
        return webRun ? (
            <iframe
                key={webRun.id}
                title="Preview"
                srcDoc={webRun.code}
                sandbox="allow-scripts allow-modals allow-forms"
                className="h-full w-full bg-white"
            />
        ) : (
            <p className="p-4 text-sm text-slate-500">Press Run to preview your page here.</p>
        )
    }

    if (lines.length === 0 && !pending) {
        return <p className="text-sm text-slate-500">{running ? 'Running…' : 'Press Run to see your output here.'}</p>
    }

    return (
        <div className="whitespace-pre-wrap font-mono text-sm">
            {lines.map((l, i) => (
                <div key={i} className={colors[l.type]}>
                    {l.text || '\u00a0'}
                </div>
            ))}
            {pending && <InputLine key={pending.id} prompt={pending.prompt} onSubmit={onInput} />}
        </div>
    )
}