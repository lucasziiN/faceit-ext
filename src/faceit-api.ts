declare const process: { env: { FACEIT_API_KEY: string } }
const FACEIT_API_KEY = process.env.FACEIT_API_KEY

export async function getPlayerByNickname(nickname: string) {
    try {
        const response = await fetch(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`
            }
        })

        // Check if response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data.player_id
    } catch (error) {
        console.error('fetch error: ', error)
    }
}

export async function getPlayerStatsById(playerId: string) {
    try {
        const response = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`, {
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


export async function getPlayerHistory(playerId: string) {
    try {
        const response = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/history`, {
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

export async function getMatchStats(matchId: string) {
    try {
        const response = await fetch(`https://open.faceit.com/data/v4/matches/${matchId}/stats`, {
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

export async function getMatchDetails(matchId: string) {
    try {
        const response = await fetch(`https://open.faceit.com/data/v4/matches/${matchId}`, {
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
