import { getMatchDetails } from './faceit-api'

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
        if (matchId){
            getMatchDetails(matchId).then(data => console.log(data))
        }
    }
});