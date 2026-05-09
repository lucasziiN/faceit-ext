import { getPlayerByNickname, getPlayerStatsById, getPlayerHistory, getMatchStats, getMatchDetails} from './faceit-api'

async function main(){
    const player_id = await getPlayerByNickname("lucasziiN")
    const stats = await getPlayerStatsById(player_id)
    const player_history = await getPlayerHistory(player_id)
    const last_match = await getMatchStats(player_history.items[0].match_id)
    const curr_match = await getMatchDetails('1-1a0a9187-d81f-4b17-be7f-e458d7080708')
    console.log(curr_match)
}
main()