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

// Blocks this worker until the student types a line in the Output pane.
// It makes a synchronous request that the service worker (stdin-sw.js) only
// answers once the page forwards the typed text.
function readInput(prompt) {
    const id = Math.random().toString(36).slice(2)
    self.postMessage({ type: 'input', text: String(prompt ?? ''), id })

    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/__stdin__?id=' + id, false) // false = synchronous
    xhr.send()

    if (xhr.getResponseHeader('X-Stdin') !== '1') {
        throw new Error('Interactive input is not available yet. Reload the page and try again.')
    }
    return xhr.responseText
}

// setTimeout/setInterval that the run waits for, so the program doesn't
// "finish" while timers are still pending.
function createTimers() {
    const active = new Map()
    let next = 0
    let notifyIdle = () => { }

    function add(make, repeat) {
        return (fn, ms = 0, ...args) => {
            const id = ++next
            const tick = () => {
                if (!repeat) active.delete(id)
                try {
                    fn(...args)
                } catch (err) {
                    send('error', describe(err))
                }
                if (active.size === 0) notifyIdle()
            }
            active.set(id, make(tick, ms))
            return id
        }
    }

    function remove(clear) {
        return (id) => {
            if (active.has(id)) {
                clear(active.get(id))
                active.delete(id)
            }
            if (active.size === 0) notifyIdle()
        }
    }

    return {
        setTimeout: add(setTimeout, false),
        setInterval: add(setInterval, true),
        clearTimeout: remove(clearTimeout),
        clearInterval: remove(clearInterval),
        whenIdle: () =>
            new Promise((resolve) => {
                if (active.size === 0) resolve()
                else notifyIdle = resolve
            }),
    }
}

async function runJavaScript(code) {
    const out = (type) => (...args) => send(type, args.map(format).join(' '))
    const log = out('log')
    const sandboxConsole = { log, info: log, warn: out('warn'), error: out('error') }
    const timers = createTimers()

    // AsyncFunction lets students use `await` at the top level
    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor

    send('exec')
    await new AsyncFunction(
        'console', 'prompt', 'alert', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
        code,
    )(
        sandboxConsole,
        (msg) => readInput(msg),
        (msg) => log(msg),
        timers.setTimeout, timers.setInterval, timers.clearTimeout, timers.clearInterval,
    )

    await timers.whenIdle() // keep running until every timer has fired or been cleared
}

async function runPython(code) {
    if (!pyodide) {
        send('info', 'Loading Python (the first run takes a few seconds)…')
        importScripts(PYODIDE_URL + 'pyodide.js')
        pyodide = await loadPyodide({ indexURL: PYODIDE_URL })

        // Replace Python's input() with one that asks the page for a line of text
        pyodide.globals.set('_read_input', readInput)
        pyodide.runPython(`
import builtins
def _input(prompt=""):
    return _read_input(str(prompt))
builtins.input = _input
`)
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