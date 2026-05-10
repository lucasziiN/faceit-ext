interface PlayerCard {
    nickname: string
    skillLevel: number
    avatar: string
    traits: string[]
    summary: string
}

const PANEL_ID = 'faceit-ext-panel'

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PLAYERS_ANALYSED') {
        renderPanel(message.players)
    }
})

function renderPanel(players: PlayerCard[]) {
    document.getElementById(PANEL_ID)?.remove()

    const panel = document.createElement('div')
    panel.id = PANEL_ID
    panel.style.cssText = 'position:fixed;top:80px;right:20px;width:340px;max-height:80vh;overflow-y:auto;background:#1f1f1f;color:#fff;padding:12px;border:1px solid #444;border-radius:8px;z-index:99999;font-family:sans-serif;font-size:13px'

    const heading = document.createElement('h3')
    heading.textContent = 'Match analysis'
    panel.appendChild(heading)

    for (const player of players) {
        panel.appendChild(buildPlayerRow(player))
    }

    document.body.appendChild(panel)
}

function buildPlayerRow(player: PlayerCard): HTMLElement {
    const row = document.createElement('div')
    row.className = 'faceit-ext-row'
    row.style.cssText = 'display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #333'

    const avatar = document.createElement('img')
    avatar.src = player.avatar
    avatar.className = 'faceit-ext-avatar'
    avatar.style.cssText = 'width:32px;height:32px;border-radius:50%;flex-shrink:0'

    const info = document.createElement('div')
    info.className = 'faceit-ext-info'
    info.style.cssText = 'flex:1;min-width:0'

    const name = document.createElement('div')
    name.className = 'faceit-ext-name'
    name.textContent = `${player.nickname} (lvl ${player.skillLevel})`

    const summary = document.createElement('div')
    summary.className = 'faceit-ext-summary'
    summary.textContent = player.summary

    info.appendChild(name)
    info.appendChild(summary)

    row.appendChild(avatar)
    row.appendChild(info)

    return row
}
