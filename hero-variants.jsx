/* Hero variants — each is a self-contained, full-bleed treatment */

const VID = "assets/heroVideo.mp4";

// Shared video element — wrapped so we can crossfade the seam at loop boundary
const HeroVideo = ({ className = "", style = {}, seamless = true }) => {
  const ref = React.useRef(null);
  const [fade, setFade] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    if (!seamless) return;
    const v = ref.current; if (!v) return;
    const FADE_WINDOW = 0.55; // seconds before end to start dimming
    let raf;
    const tick = () => {
      if (v.duration && isFinite(v.duration)) {
        const remaining = v.duration - v.currentTime;
        if (remaining < FADE_WINDOW) {
          setFade(1 - (remaining / FADE_WINDOW));
        } else if (v.currentTime < FADE_WINDOW) {
          setFade(1 - (v.currentTime / FADE_WINDOW));
        } else {
          setFade(0);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seamless]);

  // Track buffering / loading state across the video element
  React.useEffect(() => {
    const v = ref.current; if (!v) return;
    const start = () => setLoading(true);
    const stop = () => setLoading(false);
    v.addEventListener('loadstart', start);
    v.addEventListener('waiting', start);
    v.addEventListener('stalled', start);
    v.addEventListener('canplay', stop);
    v.addEventListener('playing', stop);
    v.addEventListener('loadeddata', stop);
    // If already buffered by the time we mount
    if (v.readyState >= 3) setLoading(false);
    return () => {
      v.removeEventListener('loadstart', start);
      v.removeEventListener('waiting', start);
      v.removeEventListener('stalled', start);
      v.removeEventListener('canplay', stop);
      v.removeEventListener('playing', stop);
      v.removeEventListener('loadeddata', stop);
    };
  }, []);

  return (
    <React.Fragment>
      <video ref={ref} className={className} style={style}
             src={VID} autoPlay muted loop playsInline preload="auto"/>
      {seamless && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "#04080F",
          opacity: fade * 0.85,
          transition: "opacity 60ms linear",
          zIndex: 5,
          mixBlendMode: "multiply",
        }}/>
      )}
      {/* Loader overlay — fades out when the video can play */}
      <div className={"hero-video-loader" + (loading ? " is-loading" : "")}>
        <svg className="hero-spinner" viewBox="0 0 50 50" aria-hidden="true">
          <circle className="hero-spinner-track" cx="25" cy="25" r="20"
                  fill="none" strokeWidth="2.5"/>
          <circle className="hero-spinner-arc" cx="25" cy="25" r="20"
                  fill="none" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div className="hero-loader-label">BUFFERING REEL</div>
      </div>
    </React.Fragment>
  );
};

const Chrome = ({ children, style = {} }) => (
  <span className="chrome" style={style}>{children}</span>
);

const Dot = ({ color = "var(--cyan)" }) => (
  <span style={{
    display: "inline-block", width: 6, height: 6,
    background: color, borderRadius: "50%",
    boxShadow: `0 0 8px ${color}`,
    animation: "pulse 1.6s ease-in-out infinite",
  }}/>
);

/* ───────────────────────── VARIANT 1: VERTICAL TAPE ───────────────────────── */
function VariantTape({ name = "ABDUL BASIT", role = "GAME DEVELOPER" }) {
  return (
    <div className="v-tape">
      {/* Left vertical marquee column */}
      <div className="tape-col tape-left">
        <div className="tape-track">
          {Array.from({length: 3}).map((_,i) => (
            <div key={i} className="tape-word">{name} · {name} · </div>
          ))}
        </div>
      </div>

      {/* Center content */}
      <div className="tape-main">
        <div className="tape-meta">
          <Chrome><Dot/> LIVE · PORTFOLIO REEL 2026</Chrome>
        </div>
        <h1 className="tape-name">
          <span>ABDUL</span>
          <span className="cyan">BASIT</span>
          <span>FAROOQ</span>
        </h1>
        <div className="tape-role">
          <span className="bar"/>{role} · UNITY
        </div>
        <div className="tape-foot">
          <div><span className="muted"><span style={{color:"#d8eef8"}}>8+</span></span> YEARS OF EXPERIENCE · 40+ TITLES SHIPPED</div>
          <div className="tape-cta">
            <a className="btn-cyan" href="#portfolio">VIEW REEL →</a>
            <a className="btn-ghost" href="#contact">GET IN TOUCH</a>
          </div>
        </div>
      </div>

      {/* Right portrait video */}
      <div className="tape-video">
        <div className="tape-video-frame">
          <HeroVideo className="tape-video-el"/>
          <div className="tape-video-overlay">
            <div className="corner tl"/><div className="corner tr"/>
            <div className="corner bl"/><div className="corner br"/>
            <div className="hud-top">
              <span><Dot color="var(--orange)"/> REC</span>
              <span>00:00:42:18</span>
            </div>
            <div className="hud-bottom">
              <span>SHOWREEL.MP4</span>
              <span>2160p · LOOP</span>
            </div>
          </div>
        </div>
        <div className="tape-video-cap">
          <Chrome>FRAME 0048 / 4032</Chrome>
        </div>
      </div>

      {/* Right vertical marquee */}
      <div className="tape-col tape-right">
        <div className="tape-track reverse">
          {Array.from({length: 3}).map((_,i) => (
            <div key={i} className="tape-word small">UNITY · UNREAL · WEBGL · AR · VR · MULTIPLAYER · </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── VARIANT 2: TYPE PORTAL ───────────────────────── */
function VariantTypePortal({ name = "BASIT" }) {
  // Video shows THROUGH text-shaped holes in a dark overlay via SVG mask
  return (
    <div className="v-portal">
      <div className="portal-top">
        <Chrome><Dot/> ABDUL <span className="muted">·</span> GAME DEVELOPER <span className="muted">·</span> KARACHI → WORLD</Chrome>
        <Chrome>EST. 2018 · UNITY · UNREAL · WEBGL</Chrome>
      </div>

      {/* The giant masked text */}
      <div className="portal-stage">
        <video className="portal-video-bg" src={VID} autoPlay muted loop playsInline/>
        {/* Dark overlay with text-shaped holes punched out via SVG mask */}
        <svg className="portal-mask-svg" viewBox="0 0 1000 380" preserveAspectRatio="xMidYMid meet">
          <defs>
            <mask id="text-cutout">
              <rect width="1000" height="380" fill="white"/>
              <text
                x="500" y="305"
                textAnchor="middle"
                fontFamily="'Bebas Neue', sans-serif"
                fontSize="380"
                letterSpacing="12"
                fill="black"
              >{name}</text>
            </mask>
          </defs>
          <rect width="1000" height="380" fill="#04080F" mask="url(#text-cutout)"/>
          {/* Cyan stroke outline of the text — adds a glow rim */}
          <text
            x="500" y="305"
            textAnchor="middle"
            fontFamily="'Bebas Neue', sans-serif"
            fontSize="380"
            letterSpacing="12"
            fill="none"
            stroke="rgba(0,212,255,0.35)"
            strokeWidth="1"
          >{name}</text>
        </svg>
        <div className="portal-scan"/>
        <div className="portal-frame-corners">
          <div className="corner tl"/><div className="corner tr"/>
          <div className="corner bl"/><div className="corner br"/>
        </div>
      </div>

      <div className="portal-bottom">
        <div className="portal-role">
          <div className="role-label">ROLE</div>
          <div className="role-value">SENIOR GAME<br/>DEVELOPER</div>
        </div>
        <div className="portal-stats">
          <div><b>40+</b><span>SHIPPED</span></div>
          <div><b>7Y</b><span>EXPERIENCE</span></div>
          <div><b>12</b><span>PLATFORMS</span></div>
        </div>
        <div className="portal-cta">
          <a className="btn-cyan" href="#portfolio">SEE THE WORK</a>
          <div className="muted small">↓ SCROLL TO ENTER</div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── VARIANT 3: CIRCULAR LENS ───────────────────────── */
function VariantLens({ name = "ABDUL BASIT FAROOQ" }) {
  return (
    <div className="v-lens">
      {/* Background giant text */}
      <div className="lens-bg-text">
        <span>ABDUL</span>
        <span>BASIT</span>
        <span>FAROOQ</span>
      </div>

      {/* Crosshair grid */}
      <svg className="lens-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="g" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="0.1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#g)"/>
      </svg>

      {/* The lens */}
      <div className="lens-wrap">
        <div className="lens-ring outer"/>
        <div className="lens-ring mid"/>
        <div className="lens-ring inner"/>
        <div className="lens-circle">
          <HeroVideo className="lens-video"/>
          <div className="lens-cross">
            <div className="cx h"/><div className="cx v"/>
          </div>
        </div>
        <div className="lens-tick" style={{transform:"rotate(0deg)"}}><span>N</span></div>
        <div className="lens-tick" style={{transform:"rotate(90deg)"}}><span>E</span></div>
        <div className="lens-tick" style={{transform:"rotate(180deg)"}}><span>S</span></div>
        <div className="lens-tick" style={{transform:"rotate(270deg)"}}><span>W</span></div>
      </div>

      {/* HUD corners */}
      <div className="lens-hud tl">
        <Chrome><Dot/> SYSTEM ONLINE</Chrome>
        <div className="hud-row"><span className="muted">USER</span> BASIT_F</div>
        <div className="hud-row"><span className="muted">ROLE</span> GAME DEV</div>
        <div className="hud-row"><span className="muted">YRS</span> 07.2</div>
      </div>
      <div className="lens-hud tr">
        <Chrome>2026-05-12 · 14:33:08</Chrome>
        <div className="hud-row"><span className="muted">LAT</span> 24.86°N</div>
        <div className="hud-row"><span className="muted">LON</span> 67.00°E</div>
        <div className="hud-row"><span className="muted">SIG</span> ████████░ 89%</div>
      </div>
      <div className="lens-hud bl">
        <div className="muted small">PORTFOLIO REEL</div>
        <div className="big-num">042</div>
        <div className="muted small">TITLES SHIPPED</div>
      </div>
      <div className="lens-hud br">
        <a className="btn-cyan" href="#portfolio">INITIATE →</a>
        <a className="btn-ghost" href="#contact">TRANSMIT</a>
      </div>
    </div>
  );
}

/* ───────────────────────── VARIANT 4: BRUTALIST GRID ───────────────────────── */
function VariantBrutalist() {
  return (
    <div className="v-brut">
      {/* Ticker top */}
      <div className="brut-ticker top">
        <div className="ticker-track">
          {Array.from({length:6}).map((_,i)=>(
            <span key={i}>★ AVAILABLE FOR HIRE · Q3 2026 ★ UNITY · UNREAL · WEBGL ★ KARACHI → REMOTE ★ </span>
          ))}
        </div>
      </div>

      <div className="brut-grid">
        {/* A: number */}
        <div className="brut-num">
          <div className="muted small">PORTFOLIO</div>
          <div className="huge-num">01</div>
          <div className="muted small">/ 06</div>
        </div>

        {/* B: video */}
        <div className="brut-video">
          <HeroVideo className="brut-video-el"/>
          <div className="brut-video-bar">
            <span><Dot color="var(--orange)"/> NOW PLAYING</span>
            <span>SHOWREEL · 2026</span>
          </div>
        </div>

        {/* C: meta */}
        <div className="brut-meta">
          <div className="meta-row">
            <span className="muted">NAME</span>
            <span>ABDUL BASIT FAROOQ</span>
          </div>
          <div className="meta-row">
            <span className="muted">ROLE</span>
            <span className="cyan">GAME DEVELOPER</span>
          </div>
          <div className="meta-row">
            <span className="muted">STACK</span>
            <span>UNITY · UNREAL · WEBGL</span>
          </div>
          <div className="meta-row">
            <span className="muted">BASED</span>
            <span>KARACHI, PK</span>
          </div>
          <div className="meta-row">
            <span className="muted">SINCE</span>
            <span>2018 — PRESENT</span>
          </div>
        </div>

        {/* D: giant vertical name */}
        <div className="brut-name">
          <span>ABDUL</span>
          <span className="cyan">BASIT</span>
          <span>FAROOQ</span>
        </div>

        {/* E: bio */}
        <div className="brut-bio">
          <p>
            Game developer designing playful, performant experiences across
            Unity &amp; Unreal — multiplayer, AR, hologram, and everything in between.
          </p>
          <div className="brut-cta">
            <a className="btn-cyan" href="#portfolio">VIEW REEL ↗</a>
            <a className="btn-ghost" href="#contact">SAY HI</a>
          </div>
        </div>
      </div>

      <div className="brut-ticker bot">
        <div className="ticker-track reverse">
          {Array.from({length:6}).map((_,i)=>(
            <span key={i}>↓ SCROLL FOR SELECTED WORK · 40+ SHIPPED TITLES · MULTIPLAYER · AR · WEBGL · </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── VARIANT 5: GLITCH STACK ───────────────────────── */
function VariantGlitch() {
  return (
    <div className="v-glitch">
      <div className="glitch-top">
        <Chrome><Dot/> SIGNAL_ACQUIRED // PORTFOLIO.REEL_2026</Chrome>
      </div>

      <div className="glitch-stage">
        {/* Stacked huge name with diagonal video slice */}
        <h1 className="glitch-name">
          <span className="glitch-line" data-text="ABDUL">ABDUL</span>
          <span className="glitch-line cyan" data-text="BASIT">BASIT</span>
          <span className="glitch-line" data-text="FAROOQ">FAROOQ</span>
        </h1>

        <div className="glitch-slice">
          <HeroVideo className="glitch-video"/>
          <div className="glitch-slice-grain"/>
        </div>

        <div className="glitch-tag-l">
          <div className="muted small">// ROLE</div>
          <div>GAME<br/>DEVELOPER</div>
        </div>
        <div className="glitch-tag-r">
          <div className="muted small">// EST</div>
          <div>2018</div>
        </div>
      </div>

      <div className="glitch-bottom">
        <div className="glitch-stats">
          <div><b>40+</b><span>SHIPPED</span></div>
          <div><b>7Y</b><span>EXP</span></div>
          <div><b>12</b><span>PLATFORMS</span></div>
        </div>
        <div className="glitch-cta">
          <a className="btn-cyan" href="#portfolio">ENTER PORTFOLIO →</a>
        </div>
      </div>

      <div className="scanlines"/>
    </div>
  );
}

window.HeroVariants = {
  tape: VariantTape,
  portal: VariantTypePortal,
  lens: VariantLens,
  brutalist: VariantBrutalist,
  glitch: VariantGlitch,
};
