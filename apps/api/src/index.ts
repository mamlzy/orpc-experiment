import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { onError } from '@orpc/server';
import { CORSPlugin } from '@orpc/server/plugins';
import { Hono } from 'hono';

import { router } from '@repo/router';

import { auth } from '@/lib/auth';

import type { AuthContext } from './types';

const app = new Hono<AuthContext>();

app.use(
  '*',
  serveStatic({
    root:
      process.env.NODE_ENV === 'production' ? './apps/api/public' : './public',
  })
);

app.get('/', (c) => {
  return c.text('Hello World!');
});

const handler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [onError((error) => console.error(error))],
});

app.use('/api/*', async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/api',
    context: {},
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

// auth middleware
// app.use('*', async (c, next) => {
//   const session = await auth.api.getSession({ headers: c.req.raw.headers });

//   if (!session) {
//     c.set('user', null);
//     c.set('session', null);
//     return next();
//   }

//   c.set('user', session.user);
//   c.set('session', session.session);
//   return next();
// });

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
