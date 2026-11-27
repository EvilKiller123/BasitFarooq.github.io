const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "tape",
  "palette": [
    "#FF2E97",
    "#C6FF00"
  ]
}/*EDITMODE-END*/;
const VARIANT_OPTIONS = [
  { value: "tape",      label: "01 \u00b7 Vertical Tape" },
  { value: "portal",    label: "02 \u00b7 Type Portal" },
  { value: "lens",      label: "03 \u00b7 Circular Lens" },
  { value: "brutalist", label: "04 \u00b7 Brutalist Grid" },
  { value: "glitch",    label: "05 \u00b7 Glitch Stack" },
];
const PALETTE_OPTIONS = [
  ["#00D4FF", "#FF6B35"], ["#FF2E97", "#C6FF00"],
  ["#FFB300", "#9D4EDD"], ["#A8F0FF", "#FF1744"],
];
function HeroApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const V = window.HeroVariants[t.variant] || window.HeroVariants.tape;
  React.useEffect(() => {
    const [c, o] = t.palette || PALETTE_OPTIONS[0];
    document.documentElement.style.setProperty('--cyan', c);
    document.documentElement.style.setProperty('--orange', o);
  }, [t.palette]);
  return (
    <>
      <V/>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero Variant">
          <TweakSelect value={t.variant} options={VARIANT_OPTIONS} onChange={v => setTweak('variant', v)}/>
        </TweakSection>
        <TweakSection label="Accent Palette">
          <TweakColor value={t.palette} options={PALETTE_OPTIONS} onChange={v => setTweak('palette', v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
ReactDOM.createRoot(document.getElementById('hero-mount')).render(<HeroApp/>);
