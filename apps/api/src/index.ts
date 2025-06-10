import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { CORSPlugin } from '@orpc/server/plugins';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { auth } from '@repo/auth/server';
import { router } from '@repo/router';
import type { AuthContext } from '@repo/router/types';

const app = new Hono<AuthContext>();

// CORS
app.use(
  '*',
  cors({
    origin: [process.env.NEXT_PUBLIC_WEB_BASE_URL!],
    credentials: true,
    exposeHeaders: ['x-superjson'],
  })
);

app.use(
  '*',
  serveStatic({
    root:
      process.env.NODE_ENV === 'production' ? './apps/api/public' : './public',
  })
);

// auth middleware
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  console.log('session.user => ', session?.user);

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  return next();
});

app.get('/', (c) => {
  return c.text('Hello World!');
});

const rpcHandler = new RPCHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [onError((error) => console.error(error))],
});

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context: { c },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

const openApiHandler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [onError((error) => console.error(error))],
});

app.use('/api/*', async (c, next) => {
  const { matched, response } = await openApiHandler.handle(c.req.raw, {
    prefix: '/api',
    context: { c },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
