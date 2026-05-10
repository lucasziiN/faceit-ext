interface PlayerCard {
    nickname: string
    skillLevel: number
    avatar: string
    traits: string[]
    summary: string
}

const PANEL_ID = 'faceit-ext-panel'

let cachedPlayers: PlayerCard[] = []

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PLAYERS_ANALYSED') {
        cachedPlayers = message.players
        renderPanel()
    }
    if (message.type === 'SHOW_PANEL' && cachedPlayers.length > 0) {
        renderPanel()
    }
})

function renderPanel() {
    document.getElementById(PANEL_ID)?.remove()

    const panel = document.createElement('div')
    panel.id = PANEL_ID
    panel.appendChild(buildHeader())

    for (const player of cachedPlayers) {
        panel.appendChild(buildPlayerRow(player))
    }

    document.body.appendChild(panel)
}

function buildHeader(): HTMLElement {
    const header = document.createElement('div')
    header.className = 'faceit-ext-header'

    const title = document.createElement('h3')
    title.className = 'faceit-ext-title'
    title.textContent = 'Match analysis'

    const close = document.createElement('button')
    close.className = 'faceit-ext-close'
    close.textContent = '×'
    close.title = 'Close'
    close.addEventListener('click', () => document.getElementById(PANEL_ID)?.remove())

    header.appendChild(title)
    header.appendChild(close)
    return header
}

function buildPlayerRow(player: PlayerCard): HTMLElement {
    const row = document.createElement('div')
    row.className = 'faceit-ext-row'

    const avatar = document.createElement('div')
    avatar.className = 'faceit-ext-avatar'
    if (player.avatar) {
        const img = document.createElement('img')
        img.src = player.avatar
        avatar.appendChild(img)
    }

    const info = document.createElement('div')
    info.className = 'faceit-ext-info'

    const name = document.createElement('div')
    name.className = 'faceit-ext-name'
    name.textContent = player.nickname

    const level = document.createElement('span')
    level.className = 'faceit-ext-level'
    level.textContent = player.skillLevel === 0 ? 'unranked' : `lvl ${player.skillLevel}`
    name.appendChild(level)

    const summary = document.createElement('div')
    summary.className = 'faceit-ext-summary'
    summary.textContent = player.summary

    info.appendChild(name)
    info.appendChild(summary)

    row.appendChild(avatar)
    row.appendChild(info)

    return row
}
