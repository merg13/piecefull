import { NextRequest } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function GET(request: NextRequest) {
  console.log('Image proxy request received')
  const url = new URL(request.url)
  const fullKey = url.searchParams.get('key')
  // Remove any query parameters from the key itself
  const key = fullKey?.split('?')[0]
  
  if (!key) {
    return new Response('Missing image key', { status: 400 })
  }

  try {
    console.log('Fetching from S3:', { bucket: process.env.AWS_S3_BUCKET, key })
    
    // Check if we have all required env variables
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('Missing required AWS environment variables:', {
        hasBucket: !!process.env.AWS_S3_BUCKET,
        hasRegion: !!process.env.AWS_REGION,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
      })
      return new Response('Server configuration error', { status: 500 })
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    })
    
    console.log('Sending S3 command...')
    const response = await s3Client.send(command)
    console.log('S3 response received')
    
    if (!response.Body) {
      console.error('No body in S3 response')
      return new Response('No image data received', { status: 500 })
    }

    // Get the raw bytes
    try {
      const chunks: Uint8Array[] = []
      for await (const chunk of response.Body as any) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)
      console.log('Successfully processed image data, size:', buffer.length)
      
      return new Response(buffer, {
        headers: {
          'Content-Type': response.ContentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        },
      })
    } catch (streamError) {
      console.error('Error processing stream:', streamError)
      return new Response('Error processing image data', { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching image from S3:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return new Response('Error fetching image', { status: 500 })
  }
}