import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '{de,en}/*.md', base: './src/content' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['Technical', 'Lifestyle', 'Work-Life-Balance']),
    date: z.coerce.string(),
    readTime: z.string(),
    image: z.string().optional(),
    featured: z.boolean().optional(),
    lang: z.enum(['de', 'en']).default('de'),
    translationSlug: z.string().optional(),
  }),
});

export const collections = { blog };
