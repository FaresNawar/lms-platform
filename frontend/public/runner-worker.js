// Runs student code off the main thread, so an infinite loop can't freeze the page.
// The page (useRunner.js) can terminate this worker at any time.

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
let pyodide = null

const send = (type, text) => self.postMessage({ type, text })

function format(value) {
    if (typeof value === 'string') return value
    try {
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
    } catch {
        return String(value)
    }
}

function describe(err) {
    const msg = String((err && err.message) || err)
    // Pyodide errors start with internal frames; show only the student's part
    const i = msg.indexOf('File "<exec>"')
    return i >= 0 ? 'Traceback (most recent call last):\n  ' + msg.slice(i) : msg
}

async function runJavaScript(code) {
    const out = (type) => (...args) => send(type, args.map(format).join(' '))
    const sandboxConsole = { log: out('log'), info: out('log'), warn: out('warn'), error: out('error') }

    // AsyncFunction lets students use `await` at the top level
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor
    send('exec')
    await new AsyncFunction('console', code)(sandboxConsole)
}

async function runPython(code) {
    if (!pyodide) {
        send('info', 'Loading Python (the first run takes a few seconds)…')
        importScripts(PYODIDE_URL + 'pyodide.js')
        pyodide = await loadPyodide({ indexURL: PYODIDE_URL })
    }
    pyodide.setStdout({ batched: (s) => send('log', s) })
    pyodide.setStderr({ batched: (s) => send('error', s) })

    // A fresh namespace per run, so variables from the last run don't leak into this one
    const globals = pyodide.globals.get('dict')()
    send('exec')
    try {
        await pyodide.runPythonAsync(code, { globals })
    } finally {
        globals.destroy()
    }
}

self.onmessage = async ({ data }) => {
    try {
        if (data.language === 'javascript') await runJavaScript(data.code)
        else if (data.language === 'python') await runPython(data.code)
        else send('error', 'This course type has no console runner.')
    } catch (err) {
        send('error', describe(err))
    }
    send('done')
}