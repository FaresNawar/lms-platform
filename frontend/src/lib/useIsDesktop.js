import { useSyncExternalStore } from 'react'

const query = '(min-width: 1024px)'

export function useIsDesktop() {
    return useSyncExternalStore(
        (notify) => {
            const m = window.matchMedia(query)
            m.addEventListener('change', notify)
            return () => m.removeEventListener('change', notify)
        },
        () => window.matchMedia(query).matches,
    )
}