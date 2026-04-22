# HD assets

Drop production HD imagery here. Each file becomes available at `/assets/<filename>`
at runtime.

## Recommended files

| Filename          | Purpose                                     | Size (min)        |
|-------------------|---------------------------------------------|-------------------|
| `hero-leaf.jpg`   | Hero mockup leaf shot                       | 1024 × 1024       |
| `og.jpg`          | Open-graph / social preview                 | 1200 × 630        |
| `favicon-512.png` | High-res favicon                            |  512 × 512        |

## Where each is used

- `hero-leaf.jpg` → [src/components/HeroMockup.jsx](../../src/components/HeroMockup.jsx)
  replaces the seeded `picsum.photos` placeholder.
- `og.jpg` → add as `<meta property="og:image">` in [index.html](../../index.html).

## Tips

- Export JPG at **85% quality** for photos, PNG for graphics with flat colour.
- Strip EXIF metadata before deploying (`exiftool -all= file.jpg`).
- Serve via CDN in production (Firebase Hosting / Vercel / CloudFront).
