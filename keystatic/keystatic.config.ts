import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'silenzio-tech/silenzio.biz',
  },
  collections: {
    posts: {
      label: 'Articoli',
      slugField: 'title',
      path: 'content/blogs/*', // Puntato correttamente alla tua cartella
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
    },
  },
});
