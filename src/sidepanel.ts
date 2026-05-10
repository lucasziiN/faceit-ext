// The side panel is the main UI. It runs in its own page context
// (sidepanel.html), separate from both the service worker and the
// content script. It reads match data from chrome.storage.local and
// re-renders when that data changes.

interface PlayerCard {
    nickname: string
    skillLevel: number
    elo: number | null
    avatar: string
    traits: string[]
    summary: string
}

interface Team {
    name: string
    players: PlayerCard[]
}

interface MatchData {
    matchId: string
    map: string | null
    region: string | null
    team1: Team
    team2: Team
}

// Each tab in the side panel is a "view". Adding a new section is just:
// 1. Write a function that takes (root, data) and builds DOM into root
// 2. Add an entry to this views array
// The shell handles routing, active-state styling, and re-renders.
interface View {
    id: string
    label: string
    render: (root: HTMLElement, data: MatchData | null) => void
}

const views: View[] = [
    { id: 'overview', label: 'Overview', render: renderOverview },
    { id: 'maps', label: 'Maps', render: renderComingSoon('Per-map breakdown — best/worst maps per player.') },
    { id: 'smurf', label: 'Smurf check', render: renderComingSoon('Detect suspicious accounts via social graph.') },
    { id: 'settings', label: 'Settings', render: renderComingSoon('Threshold tuning, theme, notifications.') }
]

let activeView = 'overview'
let cachedData: MatchData | null = null

async function init() {
    renderTabs()

    // Initial fetch from storage when the side panel first opens. After
    // this, the onChanged listener below keeps us in sync.
    const { matchData } = await chrome.storage.local.get('matchData')
    cachedData = matchData ?? null
    renderStatus()
    renderActiveView()

    // Live updates: when the service worker writes new match data, the
    // side panel re-renders automatically without the user having to
    // close and reopen it.
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.matchData) {
            cachedData = changes.matchData.newValue ?? null
            renderStatus()
            renderActiveView()
        }
    })
}

function renderTabs() {
    const nav = document.getElementById('tabs')!
    nav.innerHTML = ''
    for (const view of views) {
        const btn = document.createElement('button')
        btn.className = 'tab' + (view.id === activeView ? ' tab-active' : '')
        btn.textContent = view.label
        btn.addEventListener('click', () => {
            activeView = view.id
            renderTabs()
            renderActiveView()
        })
        nav.appendChild(btn)
    }
}

function renderActiveView() {
    const main = document.getElementById('main')!
    main.innerHTML = ''
    const view = views.find(v => v.id === activeView)!
    view.render(main, cachedData)
}

function renderStatus() {
    const status = document.getElementById('status')!
    if (!cachedData) {
        status.textContent = ''
        return
    }
    const parts: string[] = []
    if (cachedData.map) parts.push(cachedData.map)
    if (cachedData.region) parts.push(cachedData.region.toUpperCase())
    status.textContent = parts.join(' · ')
}

function renderOverview(root: HTMLElement, data: MatchData | null) {
    if (!data) {
        root.appendChild(buildEmpty('Open a FACEIT match room to load analysis.'))
        return
    }

    root.appendChild(buildTeamSection(data.team1))
    root.appendChild(buildVsDivider())
    root.appendChild(buildTeamSection(data.team2))
}

// Higher-order function — takes a description and returns a render
// function. Used so the placeholder views in the views array can each
// have their own message without duplicating the rendering logic.
function renderComingSoon(description: string) {
    return (root: HTMLElement) => {
        const wrapper = document.createElement('div')
        wrapper.className = 'soon'

        const tag = document.createElement('div')
        tag.className = 'soon-tag'
        tag.textContent = 'Coming soon'

        const desc = document.createElement('div')
        desc.className = 'soon-desc'
        desc.textContent = description

        wrapper.appendChild(tag)
        wrapper.appendChild(desc)
        root.appendChild(wrapper)
    }
}

function buildEmpty(message: string): HTMLElement {
    const empty = document.createElement('div')
    empty.className = 'empty'

    const icon = document.createElement('div')
    icon.className = 'empty-icon'
    icon.textContent = '🎯'

    const text = document.createElement('div')
    text.className = 'empty-text'
    text.textContent = message

    empty.appendChild(icon)
    empty.appendChild(text)
    return empty
}

function buildTeamSection(team: Team): HTMLElement {
    const section = document.createElement('section')
    section.className = 'team'

    const label = document.createElement('div')
    label.className = 'team-label'
    label.textContent = team.name
    section.appendChild(label)

    for (const player of team.players) {
        section.appendChild(buildPlayerRow(player))
    }

    return section
}

function buildVsDivider(): HTMLElement {
    const divider = document.createElement('div')
    divider.className = 'vs-divider'
    divider.textContent = 'vs'
    return divider
}

function buildPlayerRow(player: PlayerCard): HTMLElement {
    const row = document.createElement('div')
    row.className = 'player'

    // Avatar wrapper — if the player has an avatar URL we layer an img
    // on top, otherwise the CSS background SVG silhouette shows through.
    // Using textContent / createElement instead of innerHTML to avoid
    // XSS risk: nicknames are user-controlled input.
    const avatar = document.createElement('div')
    avatar.className = 'avatar'
    if (player.avatar) {
        const img = document.createElement('img')
        img.src = player.avatar
        avatar.appendChild(img)
    }

    const info = document.createElement('div')
    info.className = 'player-info'

    const nameRow = document.createElement('div')
    nameRow.className = 'player-name-row'

    const name = document.createElement('span')
    name.className = 'player-name'
    name.textContent = player.nickname

    // Skill level class drives the badge colour via CSS — see lvl-1..10
    // rules in sidepanel.css. lvl-0 = unranked, neutral grey.
    const level = document.createElement('span')
    level.className = 'player-level lvl-' + (player.skillLevel || 0)
    level.textContent = player.skillLevel === 0 ? 'unranked' : String(player.skillLevel)

    nameRow.appendChild(name)
    nameRow.appendChild(level)

    if (player.elo !== null) {
        const elo = document.createElement('span')
        elo.className = 'player-elo'
        elo.textContent = String(player.elo)
        nameRow.appendChild(elo)
    }

    const summary = document.createElement('div')
    summary.className = 'player-summary'
    summary.textContent = player.summary

    info.appendChild(nameRow)
    info.appendChild(summary)

    row.appendChild(avatar)
    row.appendChild(info)

    return row
}

init()
