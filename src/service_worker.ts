import { getMatchDetails, getPlayerStatsById } from './faceit-api'
import { detectArchetype } from './archetypes'

let lastMatchId: string | null = null

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
        chrome.tabs.sendMessage(details.tabId, { type: 'HIDE_PANEL' })
    }
})

async function handleMatchRoom(matchId: string, tabId: number) {
    const matchDetails = await getMatchDetails(matchId)
    const faction1 = matchDetails.teams.faction1
    const faction2 = matchDetails.teams.faction2

    const team1Cards = await buildTeam(faction1.roster)
    const team2Cards = await buildTeam(faction2.roster)

    chrome.tabs.sendMessage(tabId, {
        type: 'PLAYERS_ANALYSED',
        team1: { name: faction1.name, players: team1Cards },
        team2: { name: faction2.name, players: team2Cards }
    })
}

async function buildTeam(roster: any[]) {
    const stats = await Promise.all(roster.map(p => getPlayerStatsById(p.player_id)))
    return stats.map((playerStats, i) => ({
        nickname: roster[i].nickname,
        skillLevel: roster[i].game_skill_level,
        avatar: roster[i].avatar,
        ...detectArchetype(playerStats)
    }))
}
