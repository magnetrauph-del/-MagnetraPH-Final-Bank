// banner-render.js - v1 - pagguhit ng Instant Banner (pure). Walang emoji.
// Ang ibinigay na <canvas> lang ang ginagalaw nito: walang network, Firebase, Worker, storage, login o ibang DOM.
// Lahat ng text sa banner ay galing lang sa user. Walang idinadagdag na salita, presyo, pangalan o larawan.
//   renderBanner(canvas, { format, layout, theme, headline, detail, business, contact, photo })
//     photo: { source, width, height } (larawang nasa device na) o null
//   Ibinabalik: { format, layout, theme, width, height, fits, boxes } (para sa test: nasaan ang bawat bahagi)

export const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const FORMATS = Object.freeze({
  square: Object.freeze({ w: 1080, h: 1080 }),
  portrait: Object.freeze({ w: 1080, h: 1350 }),
  story: Object.freeze({ w: 1080, h: 1920 }),
});
export const LAYOUTS = Object.freeze(["center", "split", "card"]);
// Pinakamahabang text (bilang ng letra); kapareho ng maxlength sa banner.html
export const LIMITS = Object.freeze({ headline: 60, detail: 90, business: 40, contact: 50 });

const freeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") freeze(v); }); return Object.freeze(o); };

// Apat na nakatakdang kulay. Ang "text" ay para sa text sa ibabaw ng background; ang "card" ay para sa puting card.
export const THEMES = freeze({
  indigo: {
    bg: ["#27257A", "#4F46E5"], dark: true,
    text: { ink: "#FFFFFF", sub: "#E0DEFF", biz: "#C9C5FF", bar: "#A9A3FF" },
    pill: { bg: "#FFFFFF", ink: "#27257A" },
    card: { ink: "#1E1B4B", sub: "#4B4878", biz: "#4F46E5", bar: "#4F46E5", pillBg: "#4F46E5", pillInk: "#FFFFFF" },
    deco: "rgba(255,255,255,0.08)", scrim: "rgba(30,28,96,0.72)", band: "#A9A3FF",
  },
  lavender: {
    bg: ["#F7F5FF", "#E1D9FF"], dark: false,
    text: { ink: "#1E1B4B", sub: "#3D3878", biz: "#5B21B6", bar: "#7C3AED" },
    pill: { bg: "#5B21B6", ink: "#FFFFFF" },
    card: { ink: "#1E1B4B", sub: "#4B4878", biz: "#6D28D9", bar: "#7C3AED", pillBg: "#6D28D9", pillInk: "#FFFFFF" },
    deco: "rgba(91,33,182,0.07)", scrim: "rgba(247,245,255,0.8)", band: "#7C3AED",
  },
  coral: {
    bg: ["#B33A12", "#C41D46"], dark: true,
    text: { ink: "#FFFFFF", sub: "#FFE4DE", biz: "#FFD3C6", bar: "#FFB49E" },
    pill: { bg: "#FFF4EE", ink: "#8F2A0C" },
    card: { ink: "#431407", sub: "#7A3A26", biz: "#B5390B", bar: "#C2410C", pillBg: "#B5390B", pillInk: "#FFFFFF" },
    deco: "rgba(255,255,255,0.09)", scrim: "rgba(110,28,12,0.72)", band: "#FFB49E",
  },
  teal: {
    bg: ["#0F4C47", "#0C746B"], dark: true,
    text: { ink: "#FFFFFF", sub: "#D5F7F0", biz: "#A7F3E4", bar: "#FDE68A" },
    pill: { bg: "#FDE68A", ink: "#0F4C47" },
    card: { ink: "#0B3B37", sub: "#3F625E", biz: "#0B6B62", bar: "#0E7C72", pillBg: "#0B6B62", pillInk: "#FFFFFF" },
    deco: "rgba(255,255,255,0.08)", scrim: "rgba(8,48,44,0.72)", band: "#FDE68A",
  },
});

// Laki ng text at gilid bawat format. Sa Story, may malaking puwang sa itaas at ibaba (doon karaniwang may buttons ang app).
const TUNE = {
  square: { padX: 84, padTop: 84, padBottom: 84, gap: 28, head: 112, detail: 44, biz: 36, contact: 36, headLines: 4, detailLines: 3, split: 0.42 },
  portrait: { padX: 84, padTop: 96, padBottom: 96, gap: 32, head: 120, detail: 46, biz: 38, contact: 38, headLines: 4, detailLines: 3, split: 0.5 },
  story: { padX: 84, padTop: 220, padBottom: 240, gap: 40, head: 132, detail: 50, biz: 40, contact: 40, headLines: 5, detailLines: 4, split: 0.5 },
};
const MIN = { head: 44, detail: 28, biz: 26, contact: 24 };
const ELLIPSIS = "\u2026";

const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const font = (weight, size) => `${weight} ${size}px ${FONT}`;
const seg = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const graphemes = (s) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s));

// Isang linya lang, walang sobrang espasyo, at hindi lalampas sa LIMITS (proteksyon kahit iba ang tumawag)
export function clampText(value, max) {
  const s = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  const g = graphemes(s);
  return g.length > max ? g.slice(0, max).join("").trim() : s;
}

/* ---------- Text: hatiin sa mga linya, paliitin hanggang kumasya ---------- */
function wrap(ctx, text, maxW) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (!word) continue;
    if (ctx.measureText(word).width > maxW) {
      // Napakahabang salita (hal. link o numero): hatiin sa loob ng salita
      if (line) { lines.push(line); line = ""; }
      for (const g of graphemes(word)) {
        if (line && ctx.measureText(line + g).width > maxW) { lines.push(line); line = g; } else line += g;
      }
      continue;
    }
    const test = line ? line + " " + word : word;
    if (!line || ctx.measureText(test).width <= maxW) line = test;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}
function ellipsize(ctx, line, maxW) {
  let g = graphemes(line);
  while (g.length && ctx.measureText(g.join("").trimEnd() + ELLIPSIS).width > maxW) g = g.slice(0, -1);
  return g.join("").trimEnd() + ELLIPSIS;
}
function fitText(ctx, it, maxW, scale) {
  let size = Math.max(it.min, Math.round(it.max * scale));
  let lines;
  for (;;) {
    ctx.font = font(it.weight, size);
    lines = wrap(ctx, it.text, maxW);
    if (lines.length <= it.lines || size <= it.min) break;
    size = Math.max(it.min, size - 2);
  }
  let cut = false;
  if (lines.length > it.lines) {
    cut = true;
    lines = lines.slice(0, it.lines);
    lines[it.lines - 1] = ellipsize(ctx, lines[it.lines - 1], maxW);
  }
  let w = 0;
  for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  const lineH = Math.round(size * it.lh);
  return { key: it.key, color: it.color, weight: it.weight, size, lines, lineH, h: lineH * lines.length, w: Math.ceil(w), cut };
}
// Pangalan ng negosyo, maikling guhit, headline, detalye. Lumiliit nang sabay hanggang kumasya sa taas na maxH.
function textItems(d, tn, c, k = 1) {
  const list = [];
  if (d.business) list.push({ key: "business", text: d.business, weight: 700, max: Math.round(tn.biz * k), min: MIN.biz, lines: 2, lh: 1.25, color: c.biz });
  if (d.headline) {
    list.push({ key: "bar", bar: true, w: 72, h: 8, color: c.bar });
    list.push({ key: "headline", text: d.headline, weight: 800, max: Math.round(tn.head * k), min: MIN.head, lines: tn.headLines, lh: 1.08, color: c.ink });
  }
  if (d.detail) list.push({ key: "detail", text: d.detail, weight: 500, max: Math.round(tn.detail * k), min: MIN.detail, lines: tn.detailLines, lh: 1.3, color: c.sub });
  return list;
}
function fitBlock(ctx, list, maxW, maxH, gap) {
  let out = null;
  for (let i = 0; i <= 10; i++) {
    const s = 1 - i * 0.05;
    const laid = list.map((it) => (it.bar
      ? { key: "bar", bar: true, color: it.color, w: Math.round(it.w * Math.max(s, 0.75)), h: Math.round(it.h * Math.max(s, 0.75)) }
      : fitText(ctx, it, maxW, s)));
    const g = Math.round(gap * Math.max(s, 0.6));
    const h = laid.reduce((a, x) => a + x.h, 0) + g * Math.max(0, laid.length - 1);
    out = { laid, h, gap: g, fits: h <= maxH && laid.every((x) => !x.cut) };
    if (out.fits) return out;
  }
  return out;
}
// Contact: isang linya sa loob ng "pill"
function fitPill(ctx, text, tn, maxW) {
  if (!text) return null;
  const padX = 34, padY = 18;
  let size = tn.contact;
  ctx.font = font(700, size);
  while (ctx.measureText(text).width + 2 * padX > maxW && size > MIN.contact) { size = Math.max(MIN.contact, size - 2); ctx.font = font(700, size); }
  let line = text, cut = false;
  if (ctx.measureText(line).width + 2 * padX > maxW) { line = ellipsize(ctx, line, maxW - 2 * padX); cut = true; }
  const w = Math.ceil(ctx.measureText(line).width) + 2 * padX;
  return { text: line, size, padX, w, h: Math.round(size * 1.2) + 2 * padY, cut };
}

/* ---------- Pagguhit ---------- */
function rr(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function gradientBg(ctx, W, H, th) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, th.bg[0]);
  g.addColorStop(1, th.bg[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
// Malalambot na bilog sa gilid (disenyo lang, walang laman)
function deco(ctx, W, H, th, corner) {
  ctx.fillStyle = th.deco;
  ctx.strokeStyle = th.deco;
  ctx.lineWidth = 6;
  if (corner === "br") {
    circle(ctx, W * 0.98, H * 0.98, W * 0.42); ctx.fill();
    circle(ctx, W * 0.98, H * 0.98, W * 0.58); ctx.stroke();
    circle(ctx, W * 0.94, H * 0.06, W * 0.12); ctx.fill();
  } else {
    circle(ctx, W * 0.92, H * 0.05, W * 0.34); ctx.fill();
    circle(ctx, W * 0.04, H * 0.97, W * 0.26); ctx.fill();
    circle(ctx, W * 0.04, H * 0.97, W * 0.38); ctx.stroke();
  }
}
// Pinupuno ang lugar (parang "cover"); bahagyang mas mataas ang kuha para hindi maputol ang ulo sa larawan ng tao
function cover(ctx, p, x, y, w, h) {
  const s = Math.max(w / p.width, h / p.height);
  const sw = w / s, sh = h / s;
  ctx.drawImage(p.source, (p.width - sw) / 2, (p.height - sh) * 0.4, sw, sh, x, y, w, h);
}
function noShadow(ctx) { ctx.shadowColor = "rgba(0,0,0,0)"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
function drawBlock(ctx, block, x, y, align, maxW) {
  const boxes = [];
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  for (const it of block.laid) {
    const bx = align === "center" ? x - it.w / 2 : x;
    if (it.bar) {
      rr(ctx, bx, y, it.w, it.h, it.h / 2);
      ctx.fillStyle = it.color;
      ctx.fill();
      boxes.push({ role: "bar", x: bx, y, w: it.w, h: it.h });
    } else {
      ctx.font = font(it.weight, it.size);
      ctx.fillStyle = it.color;
      it.lines.forEach((l, i) => ctx.fillText(l, x, y + i * it.lineH + it.lineH / 2, maxW));
      boxes.push({ role: it.key, x: bx, y, w: it.w, h: it.h, size: it.size, lines: it.lines.length, cut: it.cut });
    }
    y += it.h + block.gap;
  }
  return boxes;
}
function drawPill(ctx, pill, x, y, bg, ink) {
  rr(ctx, x, y, pill.w, pill.h, pill.h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.font = font(700, pill.size);
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(pill.text, x + pill.padX, y + pill.h / 2, pill.w - 2 * pill.padX);
  return { role: "contact", x, y, w: pill.w, h: pill.h, size: pill.size, cut: pill.cut };
}

/* ---------- Tatlong layout ---------- */
// 1) Nasa gitna: text sa gitna; ang larawan (kung mayroon) ay buong background na may kulay sa ibabaw
function layoutCenter(ctx, W, H, th, tn, d, photo) {
  const maxW = W - 2 * tn.padX;
  const pill = fitPill(ctx, d.contact, tn, maxW);
  const bottom = H - tn.padBottom;
  const pillY = pill ? bottom - pill.h : bottom;
  const top = tn.padTop;
  const areaBottom = pill ? pillY - Math.round(tn.gap * 1.5) : bottom;
  const block = fitBlock(ctx, textItems(d, tn, th.text), maxW, areaBottom - top, tn.gap);

  if (photo) {
    cover(ctx, photo, 0, 0, W, H);
    ctx.fillStyle = th.scrim;
    ctx.fillRect(0, 0, W, H);
  } else {
    gradientBg(ctx, W, H, th);
    deco(ctx, W, H, th, "tr");
  }
  if (photo && th.dark) { ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 2; }
  const y = top + Math.max(0, Math.round((areaBottom - top - block.h) / 2));
  const boxes = drawBlock(ctx, block, W / 2, y, "center", maxW);
  noShadow(ctx);
  if (pill) boxes.push(drawPill(ctx, pill, Math.round((W - pill.w) / 2), pillY, th.pill.bg, th.pill.ink));
  return { fits: block.fits && !(pill && pill.cut), boxes };
}

// 2) Larawan sa itaas: larawan sa itaas na bahagi, text sa ibaba. Walang larawan: text sa itaas, nakahanay sa kaliwa.
function layoutSplit(ctx, W, H, th, tn, d, photo) {
  const maxW = W - 2 * tn.padX;
  const pill = fitPill(ctx, d.contact, tn, maxW);
  const bottom = H - tn.padBottom;
  const pillY = pill ? bottom - pill.h : bottom;
  const areaBottom = pill ? pillY - Math.round(tn.gap * 1.5) : bottom;
  const items = textItems(d, tn, th.text);
  let block, top, y, ph = 0;
  if (photo) {
    // Kapag mahaba ang text, liliit ang bahagi ng larawan (hanggang 28% ng taas) para kumasya ang text.
    // Inuuna ang pinakamaliit: kung hindi pa rin kumasya doon, hindi na susubukan ang iba (mas mabilis habang nagta-type).
    const at = (r) => { const p = Math.round(H * r), t = p + Math.round(tn.gap * 1.6); return { p, t, b: fitBlock(ctx, items, maxW, areaBottom - t, tn.gap) }; };
    let best = at(0.28);
    if (best.b.fits) {
      for (let r = tn.split; r > 0.28 + 1e-9; r -= 0.04) { const c = at(r); if (c.b.fits) { best = c; break; } }
    }
    ph = best.p; top = best.t; block = best.b;
    y = top + Math.max(0, Math.round((areaBottom - top - block.h) / 2));
  } else {
    top = tn.padTop;
    block = fitBlock(ctx, items, maxW, areaBottom - top, tn.gap);
    y = top + Math.max(0, Math.round((areaBottom - top - block.h) * 0.3));
  }

  gradientBg(ctx, W, H, th);
  if (photo) {
    cover(ctx, photo, 0, 0, W, ph);
    ctx.fillStyle = th.band;
    ctx.fillRect(0, ph - 6, W, 12);
  } else {
    deco(ctx, W, H, th, "br");
  }
  const boxes = drawBlock(ctx, block, tn.padX, y, "left", maxW);
  if (pill) boxes.push(drawPill(ctx, pill, tn.padX, pillY, th.pill.bg, th.pill.ink));
  return { fits: block.fits && !(pill && pill.cut), boxes };
}

// 3) Card: puting card na may text; ang larawan (kung mayroon) ay nasa likod at nakikita sa itaas ng card
function layoutCard(ctx, W, H, th, tn, d, photo, fid) {
  const m = 60, pad = 56;
  const cardW = W - 2 * m, maxW = cardW - 2 * pad;
  const c = th.card;
  const pill = fitPill(ctx, d.contact, tn, maxW);
  const topSafe = fid === "story" ? tn.padTop : m;
  const bottomSafe = fid === "story" ? tn.padBottom : m;
  const maxCardH = H - topSafe - bottomSafe;
  const items = textItems(d, tn, c, 0.85);
  const pillPart = pill ? pill.h + (items.length ? tn.gap : 0) : 0;
  let block;
  for (const limit of photo ? [Math.round(H * 0.56), maxCardH] : [maxCardH]) {
    block = fitBlock(ctx, items, maxW, limit - 2 * pad - pillPart, tn.gap);
    if (block.fits) break;
  }
  const contentH = block.h + pillPart;
  const cardH = contentH + 2 * pad;
  const cardY = photo ? H - bottomSafe - cardH : Math.round((H - cardH) / 2);

  if (photo) {
    // Larawan sa itaas na bahagi lang (hanggang gitna ng card), para makita ang mismong produkto sa itaas ng card
    gradientBg(ctx, W, H, th);
    const ph = contentH > 0 ? Math.min(H, cardY + Math.round(cardH * 0.5)) : H;
    cover(ctx, photo, 0, 0, W, ph);
  } else {
    gradientBg(ctx, W, H, th);
    deco(ctx, W, H, th, "tr");
  }
  const boxes = [];
  if (contentH > 0) {
    ctx.shadowColor = "rgba(20,18,60,0.22)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
    rr(ctx, m, cardY, cardW, cardH, 40);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    noShadow(ctx);
    boxes.push({ role: "card", x: m, y: cardY, w: cardW, h: cardH });
    boxes.push(...drawBlock(ctx, block, m + pad, cardY + pad, "left", maxW));
    if (pill) boxes.push(drawPill(ctx, pill, m + pad, cardY + pad + contentH - pill.h, c.pillBg, c.pillInk));
  }
  return { fits: block.fits && !(pill && pill.cut), boxes };
}

const LAYOUT_FN = { center: layoutCenter, split: layoutSplit, card: layoutCard };
const okPhoto = (p) => !!p && typeof p === "object" && p.source != null && p.width > 0 && p.height > 0;

export function renderBanner(canvas, opts = {}) {
  const fid = has(FORMATS, opts.format) ? opts.format : "square";
  const lid = LAYOUTS.includes(opts.layout) ? opts.layout : "center";
  const tid = has(THEMES, opts.theme) ? opts.theme : "indigo";
  const { w: W, h: H } = FORMATS[fid];
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  noShadow(ctx);
  ctx.clearRect(0, 0, W, H);
  const d = {
    headline: clampText(opts.headline, LIMITS.headline),
    detail: clampText(opts.detail, LIMITS.detail),
    business: clampText(opts.business, LIMITS.business),
    contact: clampText(opts.contact, LIMITS.contact),
  };
  const res = LAYOUT_FN[lid](ctx, W, H, THEMES[tid], TUNE[fid], d, okPhoto(opts.photo) ? opts.photo : null, fid);
  return { format: fid, layout: lid, theme: tid, width: W, height: H, fits: res.fits, boxes: res.boxes };
}
