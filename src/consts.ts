const ROOM_ID = 21452505
const LIVE_SESSION_PREFIX = `live:${ROOM_ID}:session`

export const Consts = {
  SCALE_REGEX: /^(\d+)([dm])$/,
  LIVE_INFO_TTL: 60,
  ROOM_ID: ROOM_ID,
  LIVE_SESSION_PREFIX: LIVE_SESSION_PREFIX,
  LIVE_SESSION_LATEST_KEY: `${LIVE_SESSION_PREFIX}:latest`,
  LIVE_INFO_CACHE_KEY: `live:${ROOM_ID}:info`,
  LIVE_SESSIONS_METRICS_PREFIX: `live:${ROOM_ID}:metrics:sessions`,
  LIVE_SESSIONS_METRICS_CACHE_TTL: 6 * 60 * 60, // 6h
  LIVE_VIDEOS_LIST_CACHE_KEY: `live:${ROOM_ID}:videos:list`,
  LIVE_VIDEOS_LIST_CACHE_TTL: 30 * 60,
  CLOUD_FRONT_ENDPOINT: 'https://d23nnf6i8maqjf.cloudfront.net'
}

export const Redirects: Map<string, string> = new Map([
  ['ybb.nana7mi.moe', 'https://www.bilibili.com/video/BV1wo4y1X7Tk'],
  ['live.nana7mi.moe', 'https://live.bilibili.com/21452505'],
  ['space.nana7mi.moe', 'https://space.bilibili.com/434334701'],
  ['hjj.nana7mi.moe', 'https://www.bilibili.com/video/BV1R64y1x7BJ']
]);
