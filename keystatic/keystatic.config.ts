import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  cloud: {
    project: 'silenzio-tech/silenzio.biz', // o il nome esatto del progetto registrato su Keystatic Cloud
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
