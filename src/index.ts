import { handleRequest } from './fetch_handler'
import { handleScheduledRequest } from './scheduled_handler'

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request))
})

addEventListener('scheduled', (event: ScheduledEvent) => {
  event.waitUntil(handleScheduledRequest())
})
