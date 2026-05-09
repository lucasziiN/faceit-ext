declare const process: { env: { FACEIT_API_KEY: string } }
console.log("service worker started")
async function getData() {
    try {
        const FACEIT_API_KEY = process.env.FACEIT_API_KEY
        const response = await fetch('https://open.faceit.com/data/v4/players?nickname=lucasziiN', {
            headers: {
                'Authorization': `Bearer ${FACEIT_API_KEY}`
            }
        })

        // Check if response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log(data)
    } catch (error) {
        console.error('fetch error: ', error)
    }
}
getData()