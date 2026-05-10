// Content scripts run in the context of faceit.com pages, so they can
// touch the DOM but can't make cross-origin API calls without hitting
// CORS. This script is purely a UI surface — it shows a small toast
// when the service worker tells it match data is ready, and removes
// the toast when the user leaves the match room.

const TOAST_ID = 'faceit-ext-toast'

// Listening for messages from the service worker. There's no direct
// function-call channel between the two — message passing is the
// only contract.
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'MATCH_READY') {
        renderToast()
    }
    if (message.type === 'MATCH_CLEARED') {
        document.getElementById(TOAST_ID)?.remove()
    }
})

function renderToast() {
    // Idempotent — if a toast is already there (e.g. fast double-fire),
    // remove and re-render rather than stacking.
    document.getElementById(TOAST_ID)?.remove()

    const toast = document.createElement('div')
    toast.id = TOAST_ID

    const text = document.createElement('span')
    text.textContent = 'Match analysis ready — click the extension icon to open'

    const close = document.createElement('button')
    close.textContent = '×'
    close.title = 'Dismiss'
    close.addEventListener('click', () => toast.remove())

    toast.appendChild(text)
    toast.appendChild(close)
    document.body.appendChild(toast)

    // Auto-dismiss after 6s. The identity check guards against a race:
    // if the user has already dismissed and a new toast was rendered,
    // we don't want this old setTimeout to remove the new one.
    setTimeout(() => {
        if (document.getElementById(TOAST_ID) === toast) {
            toast.classList.add('faceit-ext-toast-fading')
            setTimeout(() => toast.remove(), 300)
        }
    }, 6000)
}
