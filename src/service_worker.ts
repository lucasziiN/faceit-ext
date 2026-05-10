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
    }
})

async function handleMatchRoom(matchId: string, tabId: number) {
    const matchDetails = await getMatchDetails(matchId)
    const team1 = matchDetails.teams.faction1.roster
    const team2 = matchDetails.teams.faction2.roster
    const allPlayers = [...team1, ...team2]

    const results = await Promise.all(allPlayers.map(p => getPlayerStatsById(p.player_id)))

    const players = results.map((playerStats, i) => ({
        nickname: allPlayers[i].nickname,
        skillLevel: allPlayers[i].game_skill_level,
        avatar: allPlayers[i].avatar,
        ...detectArchetype(playerStats)
    }))

    chrome.tabs.sendMessage(tabId, { type: 'PLAYERS_ANALYSED', players })
}
