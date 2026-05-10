interface PlayerCard {
    nickname: string
    skillLevel: number
    avatar: string
    traits: string[]
    summary: string
}

interface Team {
    name: string
    players: PlayerCard[]
}

interface MatchData {
    team1: Team
    team2: Team
}

const PANEL_ID = 'faceit-ext-panel'
const PILL_ID = 'faceit-ext-pill'

let cachedMatch: MatchData | null = null

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PLAYERS_ANALYSED') {
        cachedMatch = { team1: message.team1, team2: message.team2 }
        renderPill()
    }
    if (message.type === 'SHOW_PANEL') {
        renderPanel()
    }
    if (message.type === 'HIDE_PANEL') {
        cachedMatch = null
        document.getElementById(PANEL_ID)?.remove()
        document.getElementById(PILL_ID)?.remove()
    }
})

function renderPill() {
    document.getElementById(PILL_ID)?.remove()

    const pill = document.createElement('button')
    pill.id = PILL_ID
    pill.textContent = 'Match analysis'
    pill.addEventListener('click', () => {
        pill.remove()
        renderPanel()
    })
    document.body.appendChild(pill)
}

function renderPanel() {
    document.getElementById(PANEL_ID)?.remove()
    document.getElementById(PILL_ID)?.remove()

    const panel = document.createElement('div')
    panel.id = PANEL_ID
    panel.appendChild(buildHeader())

    if (!cachedMatch) {
        panel.appendChild(buildEmptyState())
    } else {
        panel.appendChild(buildTeamSection(cachedMatch.team1))
        panel.appendChild(buildDivider())
        panel.appendChild(buildTeamSection(cachedMatch.team2))
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
    close.addEventListener('click', () => {
        document.getElementById(PANEL_ID)?.remove()
        if (cachedMatch) renderPill()
    })

    header.appendChild(title)
    header.appendChild(close)
    return header
}

function buildEmptyState(): HTMLElement {
    const empty = document.createElement('div')
    empty.className = 'faceit-ext-empty'
    empty.textContent = 'Open a match room to see analysis.'
    return empty
}

function buildTeamSection(team: Team): HTMLElement {
    const section = document.createElement('div')
    section.className = 'faceit-ext-team'

    const label = document.createElement('div')
    label.className = 'faceit-ext-team-label'
    label.textContent = team.name
    section.appendChild(label)

    for (const player of team.players) {
        section.appendChild(buildPlayerRow(player))
    }

    return section
}

function buildDivider(): HTMLElement {
    const divider = document.createElement('div')
    divider.className = 'faceit-ext-divider'
    divider.textContent = 'vs'
    return divider
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
