import { getCurrentSession } from '@/app/login/lib/actions';
import { prisma } from '@/prisma/client';
import * as S3 from '@aws-sdk/client-s3';
import { NextRequest } from 'next/server';
import { s3Client } from './lib/s3Client';

export async function GET(req: NextRequest) {
  try {
    const { user } = await getCurrentSession();

    if (!user) {
      return Response.json({ error: 'Not allowed' });
    }

    if (!process.env.S3_BUCKET) {
      return new Response('S3_BUCKET environment variable is not set', {
        status: 500,
      });
    }

    const key = req.nextUrl.searchParams.get('key');

    // Validate if the image belongs to current user
    const userImages = await prisma.board.findFirst({
      where: {
        userId: user.id,
        OR: [{ imageUrl: key }, { notes: { some: { imageUrl: key } } }],
      },
    });

    if (!userImages) {
      return Response.json({ error: 'Image not found' });
    }

    if (!key) {
      return new Response('Key is required', { status: 400 });
    }

    const command = new S3.GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    const response = await s3Client.send(command);

    const body = await response.Body?.transformToByteArray();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Error in GET:', error);
    return new Response('Failed to retrieve file', { status: 403 });
  }
}
