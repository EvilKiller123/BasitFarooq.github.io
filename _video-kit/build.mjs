// Brands every portfolio video: HyperFrames title intro + looping watermark/HUD overlay + outro,
// composited onto the original footage with ffmpeg. Originals are never modified.
// Usage: node build.mjs [slug ...]   (no args = all; existing outputs are skipped unless FORCE=1)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const KIT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const ROOT = path.resolve(KIT, "..");
const SRC = path.join(ROOT, "Portfolio");
const OUT = path.join(SRC, "branded");
const POSTERS = path.join(OUT, "posters");
const TMP = process.env.KIT_TMP || path.join(os.tmpdir(), "bf-video-kit");
const HF = path.join(os.homedir(), ".claude/skills/hyperframes/scripts/plugin-cli.mjs");
const INTRO = 3.4, OUTRO = 3.6, XF_IN = 0.6, XF_OUT = 0.6;

fs.mkdirSync(POSTERS, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(KIT, "manifest.json"), "utf8"));
const only = process.argv.slice(2);

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"] }).toString();
const hf = (project, args) => run(process.execPath, [HF, ...args], path.join(KIT, project));
const probe = (file) => {
  const j = JSON.parse(run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,width,height:format=duration", "-of", "json", file]));
  const v = j.streams.find((s) => s.codec_type === "video");
  return { w: v.width, h: v.height, dur: Number(j.format.duration), audio: j.streams.some((s) => s.codec_type === "audio") };
};

const outroFile = path.join(TMP, "outro.mp4");
if (!fs.existsSync(outroFile)) {
  console.log("rendering outro");
  hf("outro", ["render", "--quiet", "--skill=hyperframes", "-o", outroFile]);
}

manifest.forEach((item, i) => {
  if (only.length && !only.includes(item.slug)) return;
  const out = path.join(OUT, item.slug + ".mp4");
  if (fs.existsSync(out) && !process.env.FORCE) return console.log("skip", item.slug);
  const src = path.join(SRC, item.src);
  const m = probe(src);
  const no = String(i + 1).padStart(2, "0");
  const portrait = m.w / m.h < 1.3;
  const fgW = portrait ? Math.round((1080 * m.w) / m.h / 2) * 2 : null;
  console.log(`\n[${no}] ${item.title} — ${m.w}x${m.h} ${m.dur.toFixed(1)}s ${portrait ? "portrait" : "landscape"}`);

  const introFile = path.join(TMP, item.slug + "_intro.mp4");
  const frameFile = path.join(TMP, item.slug + "_frame.mov");
  const tags = item.tags.join(" · ");
  hf("intro", ["render", "--quiet", "--skill=hyperframes", "-o", introFile, "--variables",
    JSON.stringify({ projectNo: no, title: item.title, category: item.category, tags })]);
  hf("frame", ["render", "--quiet", "--skill=hyperframes", "--format", "mov", "-o", frameFile, "--variables",
    JSON.stringify({ layout: portrait ? "portrait" : "landscape", fgw: fgW || 608, projectNo: no, title: item.title,
      category: item.category, tag1: item.tags[0] || "", tag2: item.tags[1] || "", tag3: item.tags[2] || "" })]);

  const D = m.dur.toFixed(3);
  const norm = "fps=30,format=yuv420p,setsar=1";
  const fgScale = portrait ? `scale=${fgW}:1080` : "scale=1920:1080:force_original_aspect_ratio=decrease:force_divisible_by=2";
  const off1 = (INTRO - XF_IN).toFixed(3);
  const off2 = (INTRO - XF_IN + m.dur - XF_OUT).toFixed(3);
  const aNorm = "aformat=sample_rates=48000:channel_layouts=stereo";
  const srcAudio = m.audio
    ? `[1:a]atrim=0:${D},asetpts=PTS-STARTPTS,${aNorm}[sa];`
    : `anullsrc=r=48000:cl=stereo,atrim=0:${D}[sa];`;
  const fc = [
    `[1:v]fps=30,setsar=1,split[a][b]`,
    `[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=45,eq=brightness=-0.22:saturation=0.75[bg]`,
    `[b]${fgScale},setsar=1[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2[base]`,
    `[2:v]fps=30,trim=duration=${D},setpts=PTS-STARTPTS[ov]`,
    `[base][ov]overlay=format=auto,trim=duration=${D},setpts=PTS-STARTPTS,${norm}[main]`,
    `[0:v]${norm}[iv]`,
    `[3:v]${norm}[ev]`,
    `[iv][main]xfade=transition=circleopen:duration=${XF_IN}:offset=${off1}[x1]`,
    `[x1][ev]xfade=transition=fadeblack:duration=${XF_OUT}:offset=${off2}[v]`,
    `[0:a]${aNorm}[ia]`,
    srcAudio.replace(/;$/, ""),
    `[3:a]${aNorm}[ea]`,
    `[ia][sa]acrossfade=d=${XF_IN}[a1]`,
    `[a1][ea]acrossfade=d=${XF_OUT},loudnorm=I=-16:TP=-1.5:LRA=11[aout]`,
  ].join(";");
  run("ffmpeg", ["-v", "error", "-y", "-i", introFile, "-i", src, "-stream_loop", "-1", "-i", frameFile, "-i", outroFile,
    "-filter_complex", fc, "-map", "[v]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "medium", "-crf", String(item.crf || 23), "-maxrate", item.maxrate || "6M", "-bufsize", "12M", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-movflags", "+faststart",
    "-metadata", "copyright=© 2026 Basit Farooq. All rights reserved.", "-metadata", "artist=Basit Farooq",
    "-metadata", `title=${item.title} — Basit Farooq Portfolio`, out]);
  run("ffmpeg", ["-v", "error", "-y", "-ss", "3.0", "-i", introFile, "-frames:v", "1", "-vf", "scale=960:-2", "-q:v", "4",
    path.join(POSTERS, item.slug + ".jpg")]);
  fs.rmSync(frameFile, { force: true });
  console.log("  ->", path.relative(ROOT, out), (fs.statSync(out).size / 1e6).toFixed(1) + " MB");
});
