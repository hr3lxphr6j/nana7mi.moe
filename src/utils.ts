import {BinaryLike, createHmac, KeyObject} from "crypto";
import {Consts} from "./consts";

export function getYDMStringByDate(date: Date) {
  return {
    year: date.getFullYear().toString(),
    month:
      date.getMonth() + 1 < 10
        ? '0' + (date.getMonth() + 1)
        : (date.getMonth() + 1).toString(),
    day: date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString(),
  }
}


export function getCloudfrontUrl(object_name: string, key: BinaryLike | KeyObject): string {
  const ts = Date.now()
  const payload = JSON.stringify({
    'object': object_name,
    'ts': ts
  })
  console.log(payload);
  const sign = createHmac('sha256', key).update(payload).digest('hex')
  return `${Consts.CLOUD_FRONT_ENDPOINT}/${object_name}?_sign=${sign}&_ts=${ts}`;
}