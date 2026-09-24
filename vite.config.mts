import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config, fields, collection } from '@keystatic/core';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';

// Configurazione di Keystatic integrata
const keystaticConfig = config({
  storage: {
    kind: 'local',
  },
  collections: {
    posts: collection({
      label: 'Articoli',
      slugField: 'title',
      path: 'content/blog/*',
      format: { content: 'markdown' },
      schema: {
        title: fields.slug({ name: { label: 'Titolo' } }),
        date: fields.date({ label: 'Data' }),
        content: fields.document({
          label: 'Contenuto',
          formatting: true,
          dividers: true,
          links: true,
          images: true,
        }),
      },
    }),
  },
});

// Handler per le API locali di Keystatic
const keystaticApiHandler = makeGenericAPIRouteHandler(keystaticConfig, {
  slug: 'api/keystatic',
});

function keystaticPlugin() {
  return {
    name: 'keystatic-local-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/keystatic')) {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
          }
          const body = Buffer.concat(chunks).length > 0 ? Buffer.concat(chunks) : undefined;

          const protocol = req.headers['x-forwarded-proto'] || 'http';
          const host = req.headers.host || 'localhost:5173';
          const url = new URL(req.url, `${protocol}://${host}`);

          const request = new Request(url.toString(), {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : body,
          });

          try {
            const response = await keystaticApiHandler(request);
            res.statusCode = response.status;
            response.headers.forEach((value: string, key: string) => {
              res.setHeader(key, value);
            });
            const responseBody = await response.text();
            res.end(responseBody);
          } catch (err) {
            console.error('Keystatic API Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    keystaticPlugin(),
  ],
});
