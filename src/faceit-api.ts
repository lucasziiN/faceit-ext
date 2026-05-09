import { FACEIT_API } from "./constants"
declare const process: { env: { FACEIT_API_KEY: string } }
const FACEIT_API_KEY = process.env.FACEIT_API_KEY

async function faceitFetch(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`
            }
        })

        // Check if response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('fetch error: ', error)
    }
}

export async function getPlayerProfile(nickname: string) {
    return await faceitFetch(FACEIT_API.player(nickname))
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