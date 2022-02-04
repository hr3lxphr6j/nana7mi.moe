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

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getCloudfrontUrl(object_name: string, key_str: string): Promise<string> {
  const ts = Date.now()
  const payload = JSON.stringify({
    'object': object_name,
    'ts': ts
  })
  const encoder = new TextEncoder()
  const secretKeyData = encoder.encode(key_str)
  const key = await crypto.subtle.importKey('raw', secretKeyData, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  return `${Consts.CLOUD_FRONT_ENDPOINT}/${object_name}?_sign=${bufferToHex(mac)}&_ts=${ts}`;
}