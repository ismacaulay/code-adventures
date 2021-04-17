import { Duration } from './types';

const PLACEHOLDER_URL = 'https://ismacaul.dev/sh/ABC1234';

export function requestShortUrl(
    long: string,
    duration: Duration,
): Promise<string> {
    return Promise.resolve(PLACEHOLDER_URL);
}
