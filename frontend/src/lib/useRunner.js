import { useCallback, useEffect, useRef, useState } from 'react'

// The service worker that lets the code worker wait for typed input (see public/stdin-sw.js)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/stdin-sw.js').catch(() => { })
}

// How long code may run. Time spent waiting for the student to type doesn't count.
const TIMEOUT_MS = 10000

export function useRunner(language) {
    const workerRef = useRef(null)
    const timerRef = useRef(null)
    const [lines, setLines] = useState([])
    const [running, setRunning] = useState(false)
    const [pending, setPending] = useState(null) // { id, prompt } while the program waits for input

    const add = useCallback((type, text) => setLines((prev) => [...prev, { type, text }]), [])

    const kill = useCallback(() => {
        clearTimeout(timerRef.current)
        workerRef.current?.terminate()
        workerRef.current = null
        setPending(null)
    }, [])

    const arm = useCallback(() => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            kill()
            add('error', `Stopped: your code ran longer than ${TIMEOUT_MS / 1000} seconds (infinite loop?).`)
            setRunning(false)
        }, TIMEOUT_MS)
    }, [add, kill])

    // Leaving the page kills any running worker
    useEffect(() => kill, [kill])

    const run = useCallback(
        (code) => {
            // The worker is reused between runs, so Python only loads once
            if (!workerRef.current) {
                const worker = new Worker('/runner-worker.js')

                worker.onmessage = ({ data }) => {
                    if (data.type === 'exec') {
                        // The student's code starts NOW (after any Python loading): start the stopwatch
                        setLines((prev) => prev.filter((l) => l.type !== 'info'))
                        arm()
                    } else if (data.type === 'input') {
                        // The program is waiting for the student: pause the stopwatch
                        clearTimeout(timerRef.current)
                        setPending({ id: data.id, prompt: data.text })
                    } else if (data.type === 'done') {
                        clearTimeout(timerRef.current)
                        setPending(null)
                        setRunning(false)
                    } else {
                        add(data.type, data.text)
                    }
                }

                worker.onerror = (e) => {
                    kill()
                    add('error', e.message || 'The code runner failed to start.')
                    setRunning(false)
                }

                workerRef.current = worker
            }

            setLines([])
            setPending(null)
            setRunning(true)
            workerRef.current.postMessage({ language, code })
        },
        [language, add, kill, arm],
    )

    const submitInput = useCallback(
        (value) => {
            if (!pending) return
            const controller = navigator.serviceWorker?.controller

            if (!controller) {
                // Without the service worker the program would wait forever, so stop it
                kill()
                add('error', 'Interactive input is not available yet. Reload the page and try again.')
                setRunning(false)
                return
            }

            controller.postMessage({ id: pending.id, text: value })
            add('input', pending.prompt + value)
            setPending(null)
            arm()
        },
        [pending, add, kill, arm],
    )

    const stop = useCallback(() => {
        kill()
        add('error', 'Stopped.')
        setRunning(false)
    }, [add, kill])

    return { lines, running, pending, run, stop, submitInput }
}