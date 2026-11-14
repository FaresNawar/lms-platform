const colors = {
    log: 'text-slate-200',
    warn: 'text-amber-300',
    error: 'text-red-400',
    info: 'text-slate-500',
}

export default function Output({ isWeb, webRun, lines, running }) {
    if (isWeb) {
        return webRun ? (
            <iframe
                key={webRun.id}
                title="Preview"
                srcDoc={webRun.code}
                sandbox="allow-scripts allow-modals"
                className="h-full w-full bg-white"
            />
        ) : (
            <p className="p-4 text-sm text-slate-500">Press Run to preview your page here.</p>
        )
    }

    if (lines.length === 0) {
        return <p className="text-sm text-slate-500">{running ? 'Running…' : 'Press Run to see your output here.'}</p>
    }

    return (
        <div className="whitespace-pre-wrap font-mono text-sm">
            {lines.map((l, i) => (
                <div key={i} className={colors[l.type]}>
                    {l.text || '\u00a0'}
                </div>
            ))}
        </div>
    )
}