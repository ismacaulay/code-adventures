export async function fetchJSON(url: string) {
  // TODO: handle errors
  return fetch(url).then((r) => r.json());
}
