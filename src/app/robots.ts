import type { MetadataRoute } from 'next';

import { siteConfig } from '@/constant/config';

function getSiteUrl(): string {
  return siteConfig.url.replace(/\/$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
