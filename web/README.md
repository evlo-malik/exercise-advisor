# Exercise Advisor — website

The project website for [Exercise Advisor](../README.md), built with Next.js 16, React 19,
Tailwind CSS 4 and Framer Motion. Live at
[exercise-advisor-mu.vercel.app](https://exercise-advisor-mu.vercel.app).

```bash
npm ci          # install
npm run dev     # http://localhost:3000
npm run lint
npm run build   # production build
```

## Deploying

The site is deployed on Vercel. Because it lives in a sub-directory of a monorepo, the
Vercel project's **Root Directory** must be set to `web` (Project Settings → General).

## Structure

```text
src/app/            layout, global styles and the single landing page
src/components/ui/  hero, exercise showcase, carousel, testimonial cards, shadcn primitives
src/lib/utils.ts    class-name helper
```

The numbers shown on the site (features per frame, parameter count, regularisation) are
kept in sync with the Python package; update both when the model changes.
