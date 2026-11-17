// One-off: points portfolio cards at the branded videos, adds the new cards and anti-copy attributes.
import fs from "node:fs";
const page = new URL("../index.html", import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL("./manifest.json", import.meta.url), "utf8"));
let html = fs.readFileSync(page, "utf8");

// 1. Drop the card whose file no longer exists (duplicate of "Anime Selfie v2").
html = html.replace(/\n\s*<div class="game-card"[^\n]*Portfolio\/Anime Selfie Demo Video\.mp4[^\n]*<\/div>/, "");

// 2. New cards, appended after the last existing card.
const card = (cat, slug, tags, title, desc) =>
  `    <div class="game-card" data-category="${cat}"><div class="video-wrap"><video src="Portfolio/${slug}" muted loop preload="metadata"></video><div class="card-overlay"><div class="play-btn" onclick="openModal('Portfolio/${slug}')"><svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg></div></div></div><div class="card-body"><div class="card-tags">${tags
      .map((t, i) => `<span class="card-tag ${i % 2 ? "tag-orange" : "tag-cyan"}">${t}</span>`)
      .join("")}</div><div class="card-title">${title}</div><p class="card-desc" style="color: rgb(216, 238, 248)">${desc}</p></div></div>`;
const added = [
  card("ai", "AITalk.mp4", ["AI Avatar", "Voice AI", "Arabic"], "AI Talking Avatar", "Voice-driven Arabic AI avatar that listens, understands and answers with real-time lip-synced speech and live subtitles."),
  card("ai", "DigitalCloudWall.mp4", ["Interactive", "QR", "Live Wall"], "Digital Cloud Wall", "Guests scan a QR code and post messages that float onto a themed big-screen wall as glowing clouds in real time."),
  card("ai", "InteractiveSmashWall.mp4", ["Projection", "Motion Tracking"], "Smash Wall", "Projected interactive wall game where players smash flying targets with their body, tracked in real time."),
  card("ai", "PhotoboothSoftwate.mp4", ["AI Portraits", "Payments", "Kiosk"], "AI Photobooth App", "End-to-end kiosk app: live camera capture, AI style selection and built-in QR / STC Pay checkout."),
  card("ai", "Sketch AI Demo Video.mp4", ["Generative AI", "Stylus", "Big Screen"], "Sketch AI", "Draw on a tablet and watch AI turn the sketch into finished artwork on a giant screen, with QR download."),
  card("ai", "StoryNameAI.mp4", ["AI Stories", "Narration", "Arabic + EN"], "Story Name AI", "Personalised AI storybook: enter a child's name, pick a world and get a narrated bilingual adventure."),
  card("ai", "MarketingVideo.mp4", ["Motion Design", "Promo"], "AI Booth Promo", "Comic-styled promo film for an AI photo booth activation: spec sheet, crowd moments and brand reveal."),
];
const lastCard = html.lastIndexOf('<div class="game-card"');
const lastCardEnd = html.indexOf("\n", lastCard);
if (!html.includes("Portfolio/AITalk.mp4")) html = html.slice(0, lastCardEnd) + "\n" + added.join("\n") + html.slice(lastCardEnd);

// 3. Swap every original file for its branded version (+ poster + no-download attributes).
for (const m of manifest) {
  const from = `Portfolio/${m.src}`, to = `Portfolio/branded/${m.slug}.mp4`;
  html = html.split(`<video src="${from}" muted loop preload="metadata">`).join(
    `<video src="${to}" poster="Portfolio/branded/posters/${m.slug}.jpg" muted loop playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noremoteplayback" draggable="false">`);
  html = html.split(`openModal('${from}')`).join(`openModal('${to}')`);
}

// 4. Modal player: no download button, no PiP, no right-click.
html = html.replace('<video id="modal-video" controls></video>',
  '<video id="modal-video" controls playsinline disablepictureinpicture controlslist="nodownload noremoteplayback" draggable="false"></video>');

// 5. Card videos ignore pointer events (no "Save video as…"), and hover previews skip the title intro.
html = html.replace(".video-wrap video{width:100%;height:100%;object-fit:cover;display:block;}",
  ".video-wrap video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;user-select:none;}");
html = html.replace("card.addEventListener('mouseenter',()=>v.play());",
  "card.addEventListener('mouseenter',()=>{if(v.currentTime<3.4&&v.duration>8)v.currentTime=3.4;v.play();});");
html = html.replace("document.addEventListener('keydown',e=>{",
  "// VIDEO PROTECTION — block the context menu / drag on every video (download button is hidden via controlslist)\n" +
  "document.addEventListener('contextmenu',e=>{if(e.target.closest('video,.video-wrap,.modal-inner'))e.preventDefault();});\n" +
  "document.addEventListener('dragstart',e=>{if(e.target.tagName==='VIDEO')e.preventDefault();});\n\n" +
  "document.addEventListener('keydown',e=>{");
fs.writeFileSync(page, html);
console.log("cards:", (html.match(/class="game-card"/g) || []).length,
  "| branded refs:", (html.match(/Portfolio\/branded\/[^"']+\.mp4/g) || []).length,
  "| raw Portfolio refs left:", (html.match(/Portfolio\/(?!branded)[^"']+\.mp4/g) || []));
