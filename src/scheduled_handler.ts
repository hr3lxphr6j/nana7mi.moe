import { getLiveRoomInfoWithoutCache } from './bilibili'
import { Consts } from './consts'

export async function handleScheduledRequest(): Promise<void> {
  const liveInfo = await getLiveRoomInfoWithoutCache(Consts.ROOM_ID)
  const liveTime = liveInfo.live_time

  if (liveTime != '0000-00-00 00:00:00') {
    // living
    if ((await kvs.get(Consts.LIVE_SESSION_LATEST_KEY)) != null) {
      // the latest live information has been recorded, skip
      return
    }
    // record live information
    const keyName = `${Consts.LIVE_SESSION_PREFIX}:${liveTime.replace(
      ' ',
      '_',
    )}`
    await kvs.put(Consts.LIVE_SESSION_LATEST_KEY, keyName)
    await kvs.put(keyName, '')
  } else {
    // not living
    const latestLiveSessionKey = await kvs.get(Consts.LIVE_SESSION_LATEST_KEY)
    if (latestLiveSessionKey == null || latestLiveSessionKey == '') {
      // no live that has not updated the end time
      return
    }
    const latestLiveEnd = await kvs.get(latestLiveSessionKey)
    if (latestLiveEnd === '') {
      await kvs.put(latestLiveSessionKey, new Date().toString())
    }
    await kvs.delete(Consts.LIVE_SESSION_LATEST_KEY)
  }
}
