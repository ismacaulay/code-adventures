import { Duration } from '../types';

const API_URL = '/api';

export async function requestShortUrl(
    long: string,
    duration: Duration,
): Promise<string> {
    return fetch(API_URL, {
        method: 'POST',
        // mode: 'cors',
        body: JSON.stringify({ url: long, duration }),
    })
        .then((resp) => {
            if (resp.ok) {
                return resp.json();
            }
            return Promise.reject(resp.status);
        })
        .then(({ short_url }: { short_url: string }) => {
            return short_url;
        });
}
