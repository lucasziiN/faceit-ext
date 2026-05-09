export const BASE_URL = 'https://open.faceit.com/data/v4'

export const FACEIT_API = {
    player: (nickname: string) => `${BASE_URL}/players?nickname=${nickname}`,
    playerStats: (playerId: string) => `${BASE_URL}/players/${playerId}/stats/cs2`,
    matchDetails: (matchId: string) => `${BASE_URL}/matches/${matchId}`,
    playerHistory: (playerId: string) => `${BASE_URL}/players/${playerId}/history?game=cs2&limit=20`,
    matchStats: (matchId: string) => `${BASE_URL}/matches/${matchId}/stats`,
}
