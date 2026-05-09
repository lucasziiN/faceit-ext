import { getPlayerByNickname, getPlayerStatsById } from './faceit-api'

async function main(){
    const player_id = await getPlayerByNickname("lucasziiN")
    const stats = await getPlayerStatsById(player_id)
    console.log(stats)
}
main()