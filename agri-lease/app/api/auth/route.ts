import { createAuthRouteHandlers } from '@insforge/nextjs/api';

const handlers = createAuthRouteHandlers({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://857qr4t9.ap-southeast.insforge.app',
});

export const POST = handlers.POST;
export const GET = handlers.GET;
export const DELETE = handlers.DELETE;
