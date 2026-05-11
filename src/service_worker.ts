import { getMatchDetails, getPlayerStatsById, getPlayerProfileById } from './faceit-api'
import { detectArchetype } from './archetypes'

// Service worker is the background brain of the extension.
// It can hit external APIs (content scripts can't reach FACEIT's API
// directly without CORS issues) and persists across pages, so it's
// where match-detection and data-fetching live.

// Tracks the last match room we processed so we don't re-fetch when
// FACEIT pushes multiple history entries for the same navigation.
let lastMatchId: string | null = null

// Side panels need to be told to open on action click. Doing this once
// at install time (rather than every page load) is the recommended
// pattern from Chrome's docs.
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})

// FACEIT is a single-page app — clicking around doesn't trigger a real
// page load, so we can't use chrome.webNavigation.onCompleted. The
// onHistoryStateUpdated event fires when the SPA pushes a new URL via
// the History API, which is how match room navigation actually happens.
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url.includes('/cs2/room/')) {
        // Match room URL pattern: /en/cs2/room/<matchId>[/scoreboard]
        // Splitting on '/' and grabbing the segment after 'room' is more
        // robust than .pop() because trailing segments like /scoreboard
        // would otherwise win.
        const parts = details.url.split('/')
        const roomIndex = parts.indexOf('room')
        const matchId = parts[roomIndex + 1]
        if (matchId && matchId !== lastMatchId) {
            lastMatchId = matchId
            handleMatchRoom(matchId, details.tabId)
        }
    } else if (lastMatchId) {
        // User navigated away from a match room — wipe state so the
        // side panel doesn't keep showing stale data.
        lastMatchId = null
        clearMatchData(details.tabId)
    }
})

async function handleMatchRoom(matchId: string, tabId: number) {
    const matchDetails = await getMatchDetails(matchId)
    const faction1 = matchDetails.teams.faction1
    const faction2 = matchDetails.teams.faction2

    const team1Cards = await buildTeam(faction1.roster)
    const team2Cards = await buildTeam(faction2.roster)

    const matchData = {
        matchId,
        map: matchDetails.voting?.map?.pick?.[0] ?? null,
        region: matchDetails.region ?? null,
        team1: { name: faction1.name, players: team1Cards },
        team2: { name: faction2.name, players: team2Cards }
    }

    // chrome.storage.local is the bridge between the service worker
    // and the side panel. The side panel reads this on open and also
    // listens for changes so it live-updates when new data arrives.
    await chrome.storage.local.set({ matchData })

    // The badge is the small indicator on the extension icon — gives
    // the user a passive "data is ready" signal without an intrusive
    // popup. Per-tab so opening a non-FACEIT tab doesn't show it.
    chrome.action.setBadgeText({ text: '●', tabId })
    chrome.action.setBadgeBackgroundColor({ color: '#ff5500', tabId })

    // The toast on the page is rendered by the content script. We can't
    // touch the DOM from the service worker, so we send a message and
    // the content script handles the actual rendering.
    chrome.tabs.sendMessage(tabId, { type: 'MATCH_READY' })
}

async function buildTeam(roster: any[]) {
    // Two API calls per player — stats (lifetime + per-map) and profile
    // (for ELO, which isn't in stats). Promise.all on the outer pair
    // and the inner roster.map keeps everything parallel; total wall
    // time is one round-trip rather than 20.
    const [stats, profiles] = await Promise.all([
        Promise.all(roster.map(p => getPlayerStatsById(p.player_id))),
        Promise.all(roster.map(p => getPlayerProfileById(p.player_id)))
    ])

    return stats.map((playerStats, i) => ({
        nickname: roster[i].nickname,
        skillLevel: roster[i].game_skill_level,
        // Optional chaining + nullish coalescing — if any link in the
        // chain is undefined, fall back to null instead of throwing.
        elo: profiles[i]?.games?.cs2?.faceit_elo ?? null,
        avatar: roster[i].avatar,
        ...detectArchetype(playerStats)
    }))
}

async function clearMatchData(tabId: number) {
    await chrome.storage.local.remove('matchData')
    chrome.action.setBadgeText({ text: '', tabId })
    chrome.tabs.sendMessage(tabId, { type: 'MATCH_CLEARED' })
}
