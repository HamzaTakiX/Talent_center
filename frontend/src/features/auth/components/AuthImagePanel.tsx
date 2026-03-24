import { FunctionComponent } from 'react';

interface AuthImagePanelProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  badge?: string;
  accentColor?: string;
}

const AuthImagePanel: FunctionComponent<AuthImagePanelProps> = ({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  badge,
  accentColor = 'rgba(28, 57, 142',
}) => {
  return (
    <>
      <style>{`
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
          33%       { transform: translate(18px, -28px) scale(1.12); opacity: 0.7; }
          66%       { transform: translate(-12px, 14px) scale(0.92); opacity: 0.45; }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          40%       { transform: translate(-22px, 16px) scale(1.08); opacity: 0.6; }
          70%       { transform: translate(14px, -20px) scale(0.95); opacity: 0.35; }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50%       { transform: translate(10px, 22px) scale(1.15); opacity: 0.5; }
        }
        @keyframes shimmer-badge {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slide-up-text {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up-delay {
          0%, 30% { opacity: 0; transform: translateY(24px); }
          100%    { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,255,255,0.25); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(255,255,255,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10%       { transform: translate(-1%,-2%); }
          30%       { transform: translate(1%,1%); }
          50%       { transform: translate(-1%,2%); }
          70%       { transform: translate(2%,-1%); }
          90%       { transform: translate(-2%,1%); }
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-in-panel {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .auth-image-panel { animation: fade-in-panel 0.6s ease forwards; }
        .orb-1 { animation: float-orb-1 9s ease-in-out infinite; }
        .orb-2 { animation: float-orb-2 11s ease-in-out infinite; }
        .orb-3 { animation: float-orb-3 7s ease-in-out infinite; }
        .panel-title    { animation: slide-up-text 0.7s 0.3s ease both; }
        .panel-subtitle { animation: slide-up-delay 0.9s 0.5s ease both; }
        .panel-badge    { animation: slide-up-text 0.6s 0.2s ease both; }
        .glass-card {
          backdrop-filter: blur(12px);
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
        .badge-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.55) 40%,
            rgba(255,255,255,0.18) 80%
          );
          background-size: 200% auto;
          animation: shimmer-badge 2.8s linear infinite;
        }
        .ticker-inner {
          display: flex;
          white-space: nowrap;
          animation: ticker-scroll 18s linear infinite;
        }
        .ticker-inner:hover { animation-play-state: paused; }
      `}</style>

      {/* ── Mobile hero banner (top strip, hidden on lg+) ── */}
      <div className="order-first lg:hidden w-full relative overflow-hidden text-white flex-shrink-0" style={{ height: 220 }}>
        <img
          className="w-full h-full object-cover"
          alt={imageAlt}
          src={imageSrc}
          style={{ filter: 'brightness(0.75) saturate(1.1)' }}
        />
        {/* gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(28,57,142,0.82) 0%, rgba(28,57,142,0.5) 50%, rgba(5,12,40,0.85) 100%)' }}
        />
        {/* floating orbs – lightweight on mobile */}
        <div className="orb-1 absolute rounded-full pointer-events-none" style={{ width:180, height:180, top:'-40px', right:'-50px', background:'radial-gradient(circle,rgba(99,130,255,0.45) 0%,transparent 70%)', filter:'blur(24px)' }} />
        <div className="orb-2 absolute rounded-full pointer-events-none" style={{ width:130, height:130, bottom:'-30px', left:'-30px', background:'radial-gradient(circle,rgba(120,80,255,0.38) 0%,transparent 70%)', filter:'blur(20px)' }} />
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background:'linear-gradient(90deg,transparent,rgba(140,160,255,0.7) 40%,rgba(180,200,255,0.9) 60%,transparent)' }} />
        {/* text */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-6" style={{ background:'linear-gradient(0deg,rgba(10,20,80,0.7) 0%,transparent 100%)' }}>
          <h2 className="panel-title m-0 tracking-tight" style={{ fontSize:20, fontWeight:800, lineHeight:1.25, textShadow:'0 2px 8px rgba(0,0,30,0.5)' }}>{title}</h2>
          <p className="panel-subtitle m-0 mt-1" style={{ fontSize:12, color:'rgba(200,210,255,0.88)', fontWeight:400, lineHeight:1.45 }}>{subtitle}</p>
        </div>
      </div>

      {/* ── Desktop panel (right side, hidden below lg) ── */}
      <div className="auth-image-panel hidden lg:flex lg:w-1/2 h-full relative text-white overflow-hidden">

        {/* — Background image */}
        <img
          className="w-full h-full object-cover"
          alt={imageAlt}
          src={imageSrc}
          style={{ filter: 'brightness(0.82) saturate(1.1)' }}
        />

        {/* — Deep gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              160deg,
              ${accentColor}, 0.72) 0%,
              ${accentColor}, 0.45) 40%,
              rgba(5, 12, 40, 0.88) 100%
            )`,
          }}
        />

        {/* — Subtle noise / grain texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            opacity: 0.55,
            mixBlendMode: 'overlay',
          }}
        />

        {/* — Floating orbs */}
        <div
          className="orb-1 absolute rounded-full pointer-events-none"
          style={{
            width: 280, height: 280,
            top: '-60px', right: '-80px',
            background: 'radial-gradient(circle, rgba(99,130,255,0.45) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <div
          className="orb-2 absolute rounded-full pointer-events-none"
          style={{
            width: 220, height: 220,
            bottom: '20%', left: '-60px',
            background: 'radial-gradient(circle, rgba(120,80,255,0.4) 0%, transparent 70%)',
            filter: 'blur(28px)',
          }}
        />
        <div
          className="orb-3 absolute rounded-full pointer-events-none"
          style={{
            width: 160, height: 160,
            top: '38%', right: '5%',
            background: 'radial-gradient(circle, rgba(200,180,255,0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* — Top decorative line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(140,160,255,0.7) 40%, rgba(180,200,255,0.9) 60%, transparent)',
          }}
        />



        {/* — Ticket / scrolling ticker at bottom strip */}
        <div
          className="absolute left-0 right-0 overflow-hidden pointer-events-none"
          style={{ bottom: '28%', opacity: 0.22 }}
        >
          <div className="ticker-inner" style={{ gap: 0 }}>
            {[...Array(6)].map((_, i) => (
              <span key={i} style={{ fontSize: 10, letterSpacing: '0.2em', fontWeight: 600, textTransform: 'uppercase', paddingRight: 40 }}>
                ESCA Business School &nbsp;·&nbsp; Talent Center &nbsp;·&nbsp; Internship Hub &nbsp;·&nbsp; Career Ready &nbsp;·&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* — Decorative horizontal divider line */}
        <div
          className="absolute left-8 right-8 pointer-events-none"
          style={{
            bottom: '26%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 70%, transparent)',
          }}
        />

        {/* — Main text content */}
        <div className="absolute bottom-[10%] left-[8%] right-[8%] flex flex-col gap-3">

          <h2
            className="panel-title m-0 tracking-tight"
            style={{ fontSize: 28, lineHeight: 1.22, fontWeight: 800, textShadow: '0 2px 12px rgba(0,0,30,0.4)' }}
          >
            {title}
          </h2>

          <p
            className="panel-subtitle m-0 leading-relaxed"
            style={{ fontSize: 14, color: 'rgba(200,210,255,0.88)', fontWeight: 400, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}
          >
            {subtitle}
          </p>
        </div>

        {/* — Decorative bottom glow */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '40%',
            background: 'linear-gradient(0deg, rgba(10,20,80,0.75) 0%, transparent 100%)',
          }}
        />
      </div>
    </>
  );
};

export default AuthImagePanel;
