export default function MarchingLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mLeft" x1="0" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1a4e" />
          <stop offset="60%" stopColor="#2d1b8a" />
          <stop offset="100%" stopColor="#4B2DBD" />
        </linearGradient>
        <linearGradient id="mRight" x1="50" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4B2DBD" />
          <stop offset="50%" stopColor="#00A8A0" />
          <stop offset="100%" stopColor="#00D1C7" />
        </linearGradient>
        <linearGradient id="mCenter" x1="40" y1="0" x2="60" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6C3BFF" />
          <stop offset="100%" stopColor="#00D1C7" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Perna esquerda do M */}
      <path d="M8 88 L8 18 L22 18 L22 78 L28 78 L28 88 Z" fill="url(#mLeft)" />
      {/* Diagonal esquerda descendo ao centro */}
      <path d="M22 18 L50 58 L42 68 L14 22 Z" fill="url(#mLeft)" opacity="0.9" />
      {/* Diagonal direita subindo do centro */}
      <path d="M50 58 L78 18 L86 22 L58 68 Z" fill="url(#mRight)" opacity="0.9" />
      {/* Perna direita do M */}
      <path d="M72 18 L92 18 L92 88 L72 88 L72 78 L82 78 L82 28 L72 28 Z" fill="url(#mRight)" />
      {/* Ponto central (topo do V interno) */}
      <path d="M42 68 L50 58 L58 68 L50 75 Z" fill="url(#mCenter)" filter="url(#softGlow)" />
      {/* Nós de circuito — lado esquerdo */}
      <circle cx="15" cy="45" r="2.5" fill="#00D1C7" opacity="0.8" filter="url(#softGlow)" />
      <circle cx="18" cy="62" r="1.8" fill="#6C3BFF" opacity="0.7" filter="url(#softGlow)" />
      <circle cx="24" cy="38" r="1.5" fill="#00D1C7" opacity="0.5" />
      {/* Linhas de circuito — lado esquerdo */}
      <line x1="15" y1="45" x2="22" y2="45" stroke="#00D1C7" strokeWidth="0.8" opacity="0.4" />
      <line x1="15" y1="45" x2="15" y2="52" stroke="#00D1C7" strokeWidth="0.8" opacity="0.3" />
      <line x1="18" y1="62" x2="24" y2="62" stroke="#6C3BFF" strokeWidth="0.7" opacity="0.35" />
      {/* Nós de circuito — lado direito */}
      <circle cx="79" cy="40" r="2.5" fill="#00D1C7" opacity="0.9" filter="url(#softGlow)" />
      <circle cx="84" cy="58" r="1.8" fill="#00D1C7" opacity="0.7" filter="url(#softGlow)" />
      <circle cx="76" cy="55" r="1.5" fill="#6C3BFF" opacity="0.5" />
      <circle cx="88" cy="45" r="1.2" fill="#00D1C7" opacity="0.6" />
      {/* Linhas de circuito — lado direito */}
      <line x1="79" y1="40" x2="84" y2="40" stroke="#00D1C7" strokeWidth="0.8" opacity="0.5" />
      <line x1="84" y1="40" x2="84" y2="48" stroke="#00D1C7" strokeWidth="0.8" opacity="0.4" />
      <line x1="79" y1="40" x2="79" y2="50" stroke="#00D1C7" strokeWidth="0.7" opacity="0.3" />
      <line x1="79" y1="50" x2="84" y2="58" stroke="#00D1C7" strokeWidth="0.7" opacity="0.35" />
      <line x1="88" y1="45" x2="84" y2="45" stroke="#00D1C7" strokeWidth="0.6" opacity="0.3" />
      {/* Partículas brilhantes */}
      <circle cx="35" cy="32" r="1.2" fill="white" opacity="0.4" filter="url(#softGlow)" />
      <circle cx="65" cy="28" r="1.0" fill="white" opacity="0.35" filter="url(#softGlow)" />
      <circle cx="20" cy="72" r="0.9" fill="#00D1C7" opacity="0.5" />
      <circle cx="80" cy="70" r="1.1" fill="#00D1C7" opacity="0.6" filter="url(#softGlow)" />
    </svg>
  );
}
