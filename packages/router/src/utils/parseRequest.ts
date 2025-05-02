import type { Context } from 'hono';

export async function parseRequest(ctx: Context): Promise<any> {
  const contentType = ctx.req.header('Content-Type');

  if (contentType?.includes('multipart/form-data')) {
    return ctx.req.parseBody();
  }
  if (contentType?.includes('application/json')) {
    return ctx.req.json();
  }
  throw new Error('Unsupported content type');
}
