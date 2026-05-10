document.getElementById('show-panel')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'SHOW_PANEL' })
        window.close()
    }
})
