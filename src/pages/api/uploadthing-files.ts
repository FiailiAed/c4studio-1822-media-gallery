import type { APIRoute } from 'astro';
import { verifyToken } from '@clerk/backend';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi({ token: import.meta.env.UPLOADTHING_TOKEN });

function mimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', avif: 'image/avif',
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
    webm: 'video/webm', mkv: 'video/x-matroska',
  };
  return map[ext] ?? 'application/octet-stream';
}

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const token = authHeader.slice(7);
  const payload = await verifyToken(token, {
    secretKey: import.meta.env.CLERK_SECRET_KEY,
  }).catch(() => null);
  if (!payload?.sub) {
    return new Response('Unauthorized', { status: 401 });
  }

  const appId = import.meta.env.UPLOADTHING_APP_ID ?? '';
  const { files } = await utapi.listFiles({ limit: 500 });

  const result = files
    .filter((f) => f.status === 'Uploaded')
    .map((f) => ({
      key: f.key,
      name: f.name,
      size: f.size,
      uploadedAt: f.uploadedAt,
      mimeType: mimeFromName(f.name),
      url: appId ? `https://${appId}.ufs.sh/f/${f.key}` : `https://utfs.io/f/${f.key}`,
    }));

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
};
