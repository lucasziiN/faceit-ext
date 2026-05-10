async function init() {
    const button = document.getElementById('show-panel') as HTMLButtonElement
    const status = document.getElementById('status') as HTMLElement

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const onMatchRoom = !!tab?.url?.includes('/cs2/room/')

    if (!onMatchRoom) {
        button.disabled = true
        status.textContent = 'Open a match room to use this.'
        return
    }

    button.addEventListener('click', () => {
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'SHOW_PANEL' })
            window.close()
        }
    })
}

init()
