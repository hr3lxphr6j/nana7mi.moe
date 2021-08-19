import { getLiveRoomInfoWithoutCache } from './bilibili'
import { LIVE_SESSION_LATEST_KEY, LIVE_SESSION_PREFIX, ROOM_ID } from './consts'

export async function handleScheduledRequest(): Promise<void> {
  const liveInfo = await getLiveRoomInfoWithoutCache(ROOM_ID)
  const liveTime = liveInfo.live_time

  if (liveTime != '0000-00-00 00:00:00') {
    // living
    if ((await kvs.get(LIVE_SESSION_LATEST_KEY)) != null) {
      // the latest live information has been recorded, skip
      return
    }
    // record live information
    const keyName = `${LIVE_SESSION_PREFIX}:${liveTime.replace(' ', '_')}`
    await kvs.put(LIVE_SESSION_LATEST_KEY, keyName)
    await kvs.put(keyName, '')
  } else {
    // not living
    const latestLiveSessionKey = await kvs.get(LIVE_SESSION_LATEST_KEY)
    if (latestLiveSessionKey == null || latestLiveSessionKey == '') {
      // no live that has not updated the end time
      return
    }
    const latestLiveEnd = await kvs.get(latestLiveSessionKey)
    if (latestLiveEnd === '') {
      await kvs.put(latestLiveSessionKey, new Date().toString())
    }
    await kvs.delete(LIVE_SESSION_LATEST_KEY)
  }
}
