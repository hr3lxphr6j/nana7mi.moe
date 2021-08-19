export const SCALE_REGEX = /^(\d+)([dm])$/
export const ROOM_ID = 21452505
export const LIVE_INFO_TTL = 60
export const LIVE_SESSION_PREFIX = `live:${ROOM_ID}:session`
export const LIVE_SESSION_LATEST_KEY = `${LIVE_SESSION_PREFIX}:latest`
export const LIVE_INFO_CACHE_KEY = `live:${ROOM_ID}:info`
export const LIVE_SESSIONS_METRICS_PREFIX = `live:${ROOM_ID}:metrics:sessions`
export const LIVE_SESSIONS_METRICS_CACHE_TTL = 6 * 60 * 60 // 6h
