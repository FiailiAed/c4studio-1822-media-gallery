import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { createRouteHandler } from 'uploadthing/server';
import { verifyToken } from '@clerk/backend';

const f = createUploadthing();

export const uploadRouter = {
  eventMediaUploader: f({
    image: { maxFileSize: '16MB', maxFileCount: 50 },
    video: { maxFileSize: '256MB', maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized');
      const token = authHeader.slice(7);
      const payload = await verifyToken(token, {
        secretKey: import.meta.env.CLERK_SECRET_KEY,
      }).catch(() => null);
      if (!payload?.sub) throw new Error('Unauthorized');
      return { userId: payload.sub };
    })
    .onUploadComplete(async ({ file }) => {
      return { uploadthingKey: file.key, uploadthingUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

const handlers = createRouteHandler({
  router: uploadRouter,
  config: { token: import.meta.env.UPLOADTHING_TOKEN },
});

export { handlers as GET, handlers as POST };
