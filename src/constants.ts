// Centralised URL builders for the FACEIT v4 API. Keeping these here
// (instead of inline strings in faceit-api.ts) means changing the base
// URL or the path of an endpoint is a one-line edit.
//
// Each builder takes the params and returns a fully-formed URL —
// callers don't need to know about query strings or path patterns.

export const BASE_URL = 'https://open.faceit.com/data/v4'

export const FACEIT_API = {
    playerByNickname: (nickname: string) => `${BASE_URL}/players?nickname=${nickname}`,
    playerById: (playerId: string) => `${BASE_URL}/players/${playerId}`,
    playerStats: (playerId: string) => `${BASE_URL}/players/${playerId}/stats/cs2`,
    matchDetails: (matchId: string) => `${BASE_URL}/matches/${matchId}`,
    // limit=20 caps the response to recent matches; the full history
    // is paginated and we don't need it for v1's use case.
    playerHistory: (playerId: string) => `${BASE_URL}/players/${playerId}/history?game=cs2&limit=20`,
    matchStats: (matchId: string) => `${BASE_URL}/matches/${matchId}/stats`,
}
