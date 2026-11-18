export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const [, route, segment] = url.pathname.split("/");
    let id: string | null | undefined;
    if (url.hostname === "youtu.be") {
      id = route;
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      id = route === "watch" ? url.searchParams.get("v")
        : ["embed", "shorts", "live"].includes(route) ? segment : null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
