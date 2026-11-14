// Lets the code-runner worker pause (synchronously) until the student has typed something.
// The worker makes a blocking request to /__stdin__?id=...; we hold it open until the page
// sends us the typed text with the same id.

const waiting = new Map() // id -> resolve (the request arrived first)
const answers = new Map() // id -> text (the answer arrived first)

const reply = (text) => new Response(text, { headers: { 'X-Stdin': '1' } })

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('message', ({ data }) => {
  const resolve = waiting.get(data.id)
  if (resolve) {
    waiting.delete(data.id)
    resolve(reply(data.text))
  } else {
    answers.set(data.id, data.text)
  }
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.pathname !== '/__stdin__') return // everything else passes through untouched

  const id = url.searchParams.get('id')
  event.respondWith(
    new Promise((resolve) => {
      if (answers.has(id)) {
        resolve(reply(answers.get(id)))
        answers.delete(id)
      } else {
        waiting.set(id, resolve)
      }
    }),
  )
})