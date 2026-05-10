import { getMatchDetails, getPlayerProfileByNickname, getPlayerStatsById, getPlayerProfileById} from './faceit-api'
import { detectArchetype } from './archetypes'

let lastMatchId: string | null = null

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    
    if (details.url.includes('/cs2/room/')) {
        const parts = details.url.split('/')
        const roomIndex = parts.indexOf('room')
        const matchId = parts[roomIndex + 1]
        if (matchId && matchId !== lastMatchId){
            lastMatchId = matchId
            handleMatchRoom(matchId)
        }
    }
});

async function handleMatchRoom(matchId: string){
    const matchDetails = await getMatchDetails(matchId)
    const team1 = matchDetails.teams.faction1.roster
    const team2 = matchDetails.teams.faction2.roster
    const allPlayers = [...team1, ...team2]
    
    const results = await Promise.all(allPlayers.map(player => getPlayerStatsById(player.player_id)))
    const archetypes = results.map((playerStats, index) => ({
        nickname: allPlayers[index].nickname,
        ...playerStats.lifetime
    }))
    console.log(archetypes)
}