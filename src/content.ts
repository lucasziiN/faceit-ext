const currentUrl = window.location.href;
function extractMatchIdFromUrl(url: string): string | undefined {
    if (url.includes('/cs2/room/')) {
        const urlArray: string[] = url.split('/')
        // get last element
        return urlArray.pop()
    }
}