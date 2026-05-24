import type { APIRoute } from 'astro';
import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { createRouteHandler } from 'uploadthing/server';
import { createClerkClient } from '@clerk/backend';

const f = createUploadthing();

const clerkClient = createClerkClient({ secretKey: import.meta.env.CLERK_SECRET_KEY as string });

export const uploadRouter = {
  eventMediaUploader: f({
    image: { maxFileSize: '16MB', maxFileCount: 50 },
    video: { maxFileSize: '256MB', maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
      }
      const token = authHeader.slice(7);
      const payload = await clerkClient.verifyToken(token);
      if (!payload?.sub) throw new Error('Unauthorized');
      return { userId: payload.sub };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadthingKey: file.key, uploadthingUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

const handlers = createRouteHandler({ router: uploadRouter });

export const GET: APIRoute = (ctx) => handlers.GET(ctx.request);
export const POST: APIRoute = (ctx) => handlers.POST(ctx.request);
