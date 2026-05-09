import { getMatchDetails, getPlayerStatsById} from './faceit-api'
import { detectArchetype } from './archetypes'

let lastMatchId: string | null = null

function handleMessages(message, sender, sendresponse) {
    if (message.type === 'MATCH_ROOM_DETECTED') {
        getMatchDetails(message.matchId).then(data => console.log(data))
    }
    return true
}

chrome.runtime.onMessage.addListener(handleMessages)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    
    if (details.url.includes('/cs2/room/')) {
        const matchId = details.url.split('/').pop()
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
    const archetypes = results.map(playerStats => detectArchetype(playerStats))
    console.log(archetypes)
}