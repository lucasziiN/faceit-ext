interface PlayerCard {
    nickname: string
    skillLevel: number
    avatar: string
    traits: string[]
    summary: string
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PLAYERS_ANALYSED') {
        console.log('content script received players:', message.players)
    }
})
