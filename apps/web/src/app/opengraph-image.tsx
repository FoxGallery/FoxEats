import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'FoxEats — La table de la Riviera, à votre porte';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        background: 'linear-gradient(135deg, #0B3D91 0%, #1a4ba8 50%, #FF6B5C 120%)',
        color: 'white',
        fontFamily: '"Cabinet Grotesk", "Inter", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 999,
          padding: '8px 18px',
          fontSize: 22,
          letterSpacing: 0.2,
          backdropFilter: 'blur(8px)',
          alignSelf: 'flex-start',
        }}
      >
        Côte d&apos;Azur · 30+ restaurants
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          La table de la
          <br />
          <span style={{ color: '#FF6B5C' }}>Riviera</span>, à votre porte.
        </div>
        <div style={{ marginTop: 32, fontSize: 32, opacity: 0.9 }}>
          FoxEats — foxeats.vercel.app
        </div>
      </div>
    </div>,
    { ...size },
  );
}
