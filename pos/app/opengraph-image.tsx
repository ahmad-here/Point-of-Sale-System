import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'TOSPOS – Free online POS system for small businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'app/icon.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #fffcf2 0%, #f1ece0 60%, #f6d3c3 100%)',
          color: '#252422',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={110} height={110} alt="" />
          <span style={{ fontSize: 64, fontWeight: 800 }}>TOSPOS</span>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1, maxWidth: 950 }}>Free Online POS System for Small Businesses</div>
        <div style={{ fontSize: 30, marginTop: 28, color: '#403d39' }}>
          Sales · Receipts · Inventory · Analytics — in your browser, no sign-up
        </div>
        <div style={{ display: 'flex', marginTop: 40 }}>
          <span style={{ background: '#eb5e28', color: 'white', fontSize: 28, fontWeight: 700, padding: '14px 28px', borderRadius: 12 }}>
            Start free →
          </span>
        </div>
      </div>
    ),
    size
  );
}
