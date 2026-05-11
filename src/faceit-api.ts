import { FACEIT_API } from "./constants"

// process.env.FACEIT_API_KEY is replaced at build time by esbuild's
// `define` option (see build.js). Without `declare const process` here
// TypeScript would complain since `process` only exists in Node, not
// in a browser context — but the actual value gets baked in before
// the code runs.
declare const process: { env: { FACEIT_API_KEY: string } }
const FACEIT_API_KEY = process.env.FACEIT_API_KEY

// Single fetch wrapper so every call gets the auth header and the same
// error handling. Returns undefined on failure rather than throwing —
// the callers use Promise.all and we don't want one bad player to
// abort all 10. The optional chaining downstream handles missing data.
async function faceitFetch(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('fetch error: ', error)
    }
}

export async function getPlayerProfileByNickname(nickname: string) {
    return await faceitFetch(FACEIT_API.playerByNickname(nickname))
}

export async function getPlayerProfileById(player_id: string) {
    return await faceitFetch(FACEIT_API.playerById(player_id))
}

export async function getPlayerStatsById(playerId: string) {
    return await faceitFetch(FACEIT_API.playerStats(playerId))
}

export async function getPlayerHistory(playerId: string) {
    return await faceitFetch(FACEIT_API.playerHistory(playerId))
}

export async function getMatchStats(matchId: string) {
    return await faceitFetch(FACEIT_API.matchStats(matchId))
}

export async function getMatchDetails(matchId: string) {
    return await faceitFetch(FACEIT_API.matchDetails(matchId))
}
