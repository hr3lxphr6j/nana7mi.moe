import {
    S3Client,
    GetObjectCommand,
    ListObjectsCommand,
    ListObjectsCommandOutput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3_client = new S3Client({
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
    },
})

export async function listVideos(): Promise<Array<string>> {
    const commnad = new ListObjectsCommand({
        Bucket: S3_BUCKET_NAME,
        Prefix: 'mp4/',
    })
    const resp: ListObjectsCommandOutput = await s3_client.send(commnad)
    if (resp.Contents == null) {
        return []
    }
    const res = new Array()
    for (let item of resp.Contents) {
        if (item == null || item.Key == null || item.Key.endsWith('/')) {
            continue
        }
        res.push(item.Key.replace(/^mp4\//, ''))
    }
    return res
}

export async function getVideoUrl(name: string): Promise<string> {
    return await getSignedUrl(s3_client, new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: "mp4/" + name
    }), { expiresIn: 30 })
}