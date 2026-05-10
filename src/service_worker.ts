import { getMatchDetails, getPlayerStatsById, getPlayerProfileById } from './faceit-api'
import { detectArchetype } from './archetypes'

let lastMatchId: string | null = null

chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.url.includes('/cs2/room/')) {
        const parts = details.url.split('/')
        const roomIndex = parts.indexOf('room')
        const matchId = parts[roomIndex + 1]
        if (matchId && matchId !== lastMatchId) {
            lastMatchId = matchId
            handleMatchRoom(matchId, details.tabId)
        }
    } else if (lastMatchId) {
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

    await chrome.storage.local.set({ matchData })
    chrome.action.setBadgeText({ text: '●', tabId })
    chrome.action.setBadgeBackgroundColor({ color: '#ff5500', tabId })
    chrome.tabs.sendMessage(tabId, { type: 'MATCH_READY' })
}

async function buildTeam(roster: any[]) {
    const [stats, profiles] = await Promise.all([
        Promise.all(roster.map(p => getPlayerStatsById(p.player_id))),
        Promise.all(roster.map(p => getPlayerProfileById(p.player_id)))
    ])

    return stats.map((playerStats, i) => ({
        nickname: roster[i].nickname,
        skillLevel: roster[i].game_skill_level,
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
