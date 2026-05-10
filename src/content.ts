const TOAST_ID = 'faceit-ext-toast'

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'MATCH_READY') {
        renderToast()
    }
    if (message.type === 'MATCH_CLEARED') {
        document.getElementById(TOAST_ID)?.remove()
    }
})

function renderToast() {
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

    setTimeout(() => {
        if (document.getElementById(TOAST_ID) === toast) {
            toast.classList.add('faceit-ext-toast-fading')
            setTimeout(() => toast.remove(), 300)
        }
    }, 6000)
}
