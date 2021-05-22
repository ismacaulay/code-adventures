// https://stackoverflow.com/a/43467144
export function validateURL(s: string): string | undefined {
    try {
        const url = new URL(s);
        console.log(url);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            return url.href;
        }
    } catch {}

    return undefined;
}
