/**
 * Landing Page
 * 路由: /
 */

import { Hero } from '@/components/Landing/Hero';
import { Features } from '@/components/Landing/Features';
import { UseCases } from '@/components/Landing/UseCases';
import { CTA } from '@/components/Landing/CTA';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <UseCases />
      <CTA />
    </main>
  );
}
