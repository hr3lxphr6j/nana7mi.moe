import { Consts } from './consts'

export interface LiveRoomInfo {
  uid: number
  room_id: number
  short_id: number
  attention: number
  online: number
  is_portrait: boolean
  description: string
  // 1 is living
  live_status: number
  area_id: number
  parent_area_id: number
  parent_area_name: string
  old_area_id: number
  background: string
  title: string
  user_cover: string
  keyframe: string
  is_strict_room: boolean
  // e.g 2021-08-19 19:10:37
  live_time: string
  tags: string
  is_anchor: number
  room_silent_type: string
  room_silent_level: number
  room_silent_second: number
  area_name: string
  pendants: string
  area_pendants: string
  hot_words: Array<string>
  hot_words_status: number
  verify: string
  new_pendants: any
  up_session: string
  pk_status: number
  pk_id: number
  battle_id: number
  allow_change_area_time: number
  allow_upload_cover_time: number
  studio_info: {
    status: number
    master_list: Array<any>
  }
}

interface LiveRoomInfoResponse {
  code: number
  msg: string
  message: string
  data?: LiveRoomInfo
}

export async function getLiveRoomInfoWithoutCache(
  room_id: string | number,
): Promise<LiveRoomInfo> {
  const resp = await fetch(
    `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${room_id}&from=room`,
  )
  const liveInfo: LiveRoomInfoResponse = await resp.json()
  if (liveInfo.code !== 0 || liveInfo.data == null) {
    throw new Error('failed to get live room info')
  }
  return liveInfo.data
}

export async function getLiveRoomInfo(
  room_id: string | number,
): Promise<LiveRoomInfo> {
  const cachedLiveInfo = await kvs.getWithMetadata(
    Consts.LIVE_INFO_CACHE_KEY,
    'json',
  )
  if (
    cachedLiveInfo != null &&
    cachedLiveInfo.metadata != null &&
    Math.round(Date.now()) / 1000 - (cachedLiveInfo.metadata as any).ts <
      Consts.LIVE_INFO_TTL
  ) {
    return cachedLiveInfo.value as LiveRoomInfo
  }
  const info = await getLiveRoomInfoWithoutCache(room_id)
  await kvs.put(Consts.LIVE_INFO_CACHE_KEY, JSON.stringify(info), {
    metadata: { ts: Math.round(Date.now()) / 1000 },
  })
  return info
}
