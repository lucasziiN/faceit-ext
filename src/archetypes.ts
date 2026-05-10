interface PlayerLifetime {
    'Entry Rate': string
    'Entry Success Rate': string
    '1v1 Win Rate': string
    '1v2 Win Rate': string
    'Average K/D Ratio': string
    'Sniper Kill Rate': string
    'Flashes per Round': string
    'Average Headshots %': string
    'Win Rate %': string
}

interface PlayerStats {
    player_id: string
    lifetime: PlayerLifetime
    segments: any[]
}

interface ArchetypeResult {
    traits: string[]
    summary: string
}

function parseFloat2(val: string): number {
    return parseFloat(val)
}

function getEntryTrait(entryRate: number, entrySuccess: number): string | null {
    if (entryRate > 0.20) {
        if (entrySuccess > 0.51) return 'aggressive entry — opens a lot of rounds and wins most of them'
        if (entrySuccess < 0.45) {
            if (entrySuccess < 0.30) return 'entry fragger — opens a lot of rounds but converts very poorly'
            return 'entry fragger — opens rounds but struggles to convert'
        }
        return 'entry fragger — takes a lot of first duels'
    }
    if (entryRate < 0.12) return null
    return null
}

function getBaiterTrait(entryRate: number, kd: number): string | null {
    if (entryRate < 0.12 && kd > 1.3) return 'baiter tendencies — rarely opens rounds but racks up kills'
    return null
}

function getClutchTrait(win1v1: number, win1v2: number): string | null {
    if (win1v1 >= 0.44) return 'excellent clutch player — wins 1vX situations at a high rate'
    if (win1v1 >= 0.41) return 'decent clutch player'
    if (win1v1 < 0.35) return 'struggles in clutch situations'
    return null
}

function getAWPTrait(sniperKillRate: number): string | null {
    if (sniperKillRate > 0.35) return 'likely AWPer — high percentage of kills with sniper'
    return null
}

function getSupportTrait(flashesPerRound: number): string | null {
    if (flashesPerRound > 0.50) return 'support player — flashes frequently for teammates'
    return null
}

export function detectArchetype(stats: PlayerStats): ArchetypeResult {
    const l = stats.lifetime
    const entryRate = parseFloat2(l['Entry Rate'])
    const entrySuccess = parseFloat2(l['Entry Success Rate'])
    const kd = parseFloat2(l['Average K/D Ratio'])
    const win1v1 = parseFloat2(l['1v1 Win Rate'])
    const win1v2 = parseFloat2(l['1v2 Win Rate'])
    const sniperRate = parseFloat2(l['Sniper Kill Rate'])
    const flashRate = parseFloat2(l['Flashes per Round'])

    const traits: string[] = []

    const entry = getEntryTrait(entryRate, entrySuccess)
    const baiter = getBaiterTrait(entryRate, kd)
    const clutch = getClutchTrait(win1v1, win1v2)
    const awp = getAWPTrait(sniperRate)
    const support = getSupportTrait(flashRate)

    if (entry) traits.push(entry)
    if (baiter) traits.push(baiter)
    if (clutch) traits.push(clutch)
    if (awp) traits.push(awp)
    if (support) traits.push(support)

    const summary = traits.length > 0
        ? traits.join('. ')
        : 'no strong tendencies detected'

    return { traits, summary }
}
