import type { MetadataRoute } from 'next';
import { articles, alternativePages, genrePages, toolCards } from '@/data/content';

const base = 'https://curatorfit.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/blog', '/tools', '/ai-music', '/alternatives', '/genres', '/targets', '/browse', '/no-paid-placement', '/methodology', '/waitlist'].map((route) => ({ url: `${base}${route}`, lastModified: new Date() }));
  const articleRoutes = articles.map((article) => ({ url: `${base}/blog/${article.slug}`, lastModified: new Date() }));
  const alternativeRoutes = alternativePages.map((page) => ({ url: `${base}/alternatives/${page.slug}`, lastModified: new Date() }));
  const genreRoutes = genrePages.map((page) => ({ url: `${base}/genres/${page.slug}`, lastModified: new Date() }));
  const toolRoutes = toolCards.map((tool) => ({ url: `${base}${tool.href}`, lastModified: new Date() }));
  return [...staticRoutes, ...articleRoutes, ...alternativeRoutes, ...genreRoutes, ...toolRoutes];
}
