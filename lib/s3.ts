import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import sharp from 'sharp'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function uploadPuzzleImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Compress and resize image
  const processedImage = await sharp(buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
  
  const fileName = `puzzles/${nanoid()}.jpg`
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileName,
    Body: processedImage,
    ContentType: 'image/jpeg'
  }))
  
  // Return URL that goes through our proxy
  return `/api/image-proxy?key=${fileName}`
}
