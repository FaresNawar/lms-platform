import { useCallback, useEffect, useRef, useState } from 'react'

const TIMEOUT_MS = 10000 // how long the student's code may run

export function useRunner(language) {
    const workerRef = useRef(null)
    const timerRef = useRef(null)
    const [lines, setLines] = useState([])
    const [running, setRunning] = useState(false)

    const add = useCallback((type, text) => setLines((prev) => [...prev, { type, text }]), [])

    const kill = useCallback(() => {
        clearTimeout(timerRef.current)
        workerRef.current?.terminate()
        workerRef.current = null
    }, [])

    // Leaving the page kills any running worker
    useEffect(() => kill, [kill])

    const run = useCallback(
        (code) => {
            // The worker is reused between runs, so Python only loads once
            if (!workerRef.current) {
                const worker = new Worker('/runner-worker.js')

                worker.onmessage = ({ data }) => {
                    if (data.type === 'exec') {
                        // The student's code starts NOW (after any Python loading), so start the stopwatch
                        setLines((prev) => prev.filter((l) => l.type !== 'info'))
                        timerRef.current = setTimeout(() => {
                            kill()
                            add('error', `Stopped: your code ran longer than ${TIMEOUT_MS / 1000} seconds (infinite loop?).`)
                            setRunning(false)
                        }, TIMEOUT_MS)
                    } else if (data.type === 'done') {
                        clearTimeout(timerRef.current)
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
            setRunning(true)
            workerRef.current.postMessage({ language, code })
        },
        [language, add, kill],
    )

    const stop = useCallback(() => {
        kill()
        add('error', 'Stopped.')
        setRunning(false)
    }, [add, kill])

    return { lines, running, run, stop }
}