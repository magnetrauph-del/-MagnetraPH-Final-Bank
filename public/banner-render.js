import { PRESET_BY_ID, palette } from './banner-catalog.js';
import { drawVisual, isVisualId, VISUAL_BOX } from './banner-visuals.js?v=1';
import { STUDIO_LIMITS } from './banner-studio.js';
// banner-render.js - local Canvas renderer: original layouts plus shared Studio compositions.
// Ang ibinigay na <canvas> lang ang ginagalaw nito: walang network, Firebase, Worker, storage, login o ibang DOM.
// Lahat ng text sa banner ay galing lang sa user. Walang idinadagdag na salita, presyo, pangalan o larawan.
//   renderBanner(canvas, { format, layout, theme, headline, detail, business, contact, price, photo })
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
export const LIMITS = Object.freeze({ headline: 60, detail: 115, business: 40, contact: 50, price: 24, ...STUDIO_LIMITS });

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
const MIN = { head: 44, detail: 28, biz: 26, contact: 24, price: 28 };
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
// Contact (at Presyo): isang linya sa loob ng "pill". Kapag walang "o", kapareho ito ng dati.
function fitPill(ctx, text, tn, maxW, o) {
  if (!text) return null;
  const weight = (o && o.weight) || 700;
  const floor = (o && o.min) || MIN.contact;
  const padX = 34, padY = 18;
  let size = (o && o.size) || tn.contact;
  ctx.font = font(weight, size);
  while (ctx.measureText(text).width + 2 * padX > maxW && size > floor) { size = Math.max(floor, size - 2); ctx.font = font(weight, size); }
  let line = text, cut = false;
  if (ctx.measureText(line).width + 2 * padX > maxW) { line = ellipsize(ctx, line, maxW - 2 * padX); cut = true; }
  const w = Math.ceil(ctx.measureText(line).width) + 2 * padX;
  return { text: line, size, padX, weight, w, h: Math.round(size * 1.2) + 2 * padY, cut };
}
// Presyo: hiwalay na badge -- mas malaki at mas bold kaysa contact pill, at nasa ibabaw nito.
const pricePill = (ctx, text, tn, maxW) =>
  fitPill(ctx, text, tn, maxW, { size: Math.round(tn.contact * 1.25), min: MIN.price, weight: 800 });
const PRICE_GAP = (tn) => Math.round(tn.gap * 0.7);

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
  if(p.preserve){
    const inset=Math.min(16,w*.05,h*.05),scale=Math.min((w-2*inset)/p.width,(h-2*inset)/p.height);
    const pw=p.width*scale,ph=p.height*scale,px=x+(w-pw)/2,py=y+(h-ph)/2;
    ctx.save();ctx.fillStyle=p.matte||'#F5F2FC';ctx.fillRect(x,y,w,h);
    if(p.enhance)ctx.filter='brightness(1.04) contrast(1.03)';
    ctx.drawImage(p.source,px,py,pw,ph);ctx.restore();
    return {x:px,y:py,w:pw,h:ph,scale,sourceWidth:p.width,sourceHeight:p.height,contained:true,coverage:pw*ph/(w*h)};
  }
  const s = Math.max(w / p.width, h / p.height);
  const sw = w / s, sh = h / s;
  ctx.save();
  if(p.enhance)ctx.filter="brightness(1.04) contrast(1.03)";
  ctx.drawImage(p.source, (p.width - sw) / 2, (p.height - sh) * 0.4, sw, sh, x, y, w, h);
  ctx.restore();
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
function drawPill(ctx, pill, x, y, bg, ink, role) {
  rr(ctx, x, y, pill.w, pill.h, pill.h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.font = font(pill.weight || 700, pill.size);
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(pill.text, x + pill.padX, y + pill.h / 2, pill.w - 2 * pill.padX);
  return { role: role || "contact", x, y, w: pill.w, h: pill.h, size: pill.size, cut: pill.cut };
}

/* ---------- Tatlong layout ---------- */
// 1) Nasa gitna: text sa gitna; ang larawan (kung mayroon) ay buong background na may kulay sa ibabaw
function layoutCenter(ctx, W, H, th, tn, d, photo, fid) {
  if(photo?.preserve)return layoutSplit(ctx,W,H,th,tn,d,photo,fid,'center');
  const maxW = W - 2 * tn.padX;
  const pill = fitPill(ctx, d.contact, tn, maxW);
  const price = pricePill(ctx, d.price, tn, maxW);
  const bottom = H - tn.padBottom;
  const pillY = pill ? bottom - pill.h : bottom;
  const priceY = price ? (pill ? pillY - PRICE_GAP(tn) : bottom) - price.h : 0;
  const lowest = price ? priceY : pillY;
  const top = tn.padTop;
  const areaBottom = (pill || price) ? lowest - Math.round(tn.gap * 1.5) : bottom;
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
  if (price) boxes.push(drawPill(ctx, price, Math.round((W - price.w) / 2), priceY, th.pill.bg, th.pill.ink, "price"));
  if (pill) boxes.push(drawPill(ctx, pill, Math.round((W - pill.w) / 2), pillY, th.pill.bg, th.pill.ink));
  return { fits: block.fits && !(pill && pill.cut) && !(price && price.cut), boxes };
}

// 2) Larawan sa itaas: larawan sa itaas na bahagi, text sa ibaba. Walang larawan: text sa itaas, nakahanay sa kaliwa.
function layoutSplit(ctx, W, H, th, tn, d, photo, fid, alignment='left') {
  const maxW = W - 2 * tn.padX;
  const pill = fitPill(ctx, d.contact, tn, maxW);
  const price = pricePill(ctx, d.price, tn, maxW);
  const bottom = H - tn.padBottom;
  const pillY = pill ? bottom - pill.h : bottom;
  const priceY = price ? (pill ? pillY - PRICE_GAP(tn) : bottom) - price.h : 0;
  const lowest = price ? priceY : pillY;
  const areaBottom = (pill || price) ? lowest - Math.round(tn.gap * 1.5) : bottom;
  const items = textItems(d, tn, th.text);
  let block, top, y, ph = 0, imageBounds=null;
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
    const py=photo.preserve&&fid==='story'?tn.padTop:0;
    imageBounds=cover(ctx, photo, 0, py, W, Math.max(1,ph-py));
    ctx.fillStyle = th.band;
    ctx.fillRect(0, ph - 6, W, 12);
  } else {
    deco(ctx, W, H, th, "br");
  }
  const textX=alignment==='center'?W/2:tn.padX;
  const boxes = drawBlock(ctx, block, textX, y, alignment, maxW);
  if (price) boxes.push(drawPill(ctx, price, alignment==='center'?(W-price.w)/2:tn.padX, priceY, th.pill.bg, th.pill.ink, "price"));
  if (pill) boxes.push(drawPill(ctx, pill, alignment==='center'?(W-pill.w)/2:tn.padX, pillY, th.pill.bg, th.pill.ink));
  return { fits: block.fits && !(pill && pill.cut) && !(price && price.cut), boxes,
    photoFit:imageBounds?{bounds:imageBounds,preserved:true,fallback:imageBounds.coverage<.42?'narrow-source':null}:null };
}

// 3) Card: puting card na may text; ang larawan (kung mayroon) ay nasa likod at nakikita sa itaas ng card
function layoutCard(ctx, W, H, th, tn, d, photo, fid) {
  const m = 60, pad = 56;
  const cardW = W - 2 * m, maxW = cardW - 2 * pad;
  const c = th.card;
  const pill = fitPill(ctx, d.contact, tn, maxW);
  const price = pricePill(ctx, d.price, tn, maxW);
  const topSafe = fid === "story" ? tn.padTop : m;
  const bottomSafe = fid === "story" ? tn.padBottom : m;
  const maxCardH = H - topSafe - bottomSafe;
  const items = textItems(d, tn, c, 0.85);
  // Presyo at contact: nakasalansan sa ilalim ng text sa loob ng card.
  // Kapag walang presyo, pareho ito ng dating pillPart.
  const tail = [];
  if (price) tail.push(price.h);
  if (pill) tail.push(pill.h);
  const tailPart = tail.length
    ? tail.reduce((a, b) => a + b, 0) + (tail.length > 1 ? PRICE_GAP(tn) : 0) + (items.length ? tn.gap : 0)
    : 0;
  let block;
  for (const limit of photo ? [Math.round(H * 0.56), maxCardH] : [maxCardH]) {
    block = fitBlock(ctx, items, maxW, limit - 2 * pad - tailPart, tn.gap);
    if (block.fits) break;
  }
  const contentH = block.h + tailPart;
  const cardH = contentH + 2 * pad;
  const cardY = photo ? H - bottomSafe - cardH : Math.round((H - cardH) / 2);

  let cardPhotoBounds=null;
  if (photo) {
    // Larawan sa itaas na bahagi lang (hanggang gitna ng card), para makita ang mismong produkto sa itaas ng card
    gradientBg(ctx, W, H, th);
    const ph = photo.preserve?Math.max(topSafe+1,cardY-24):(contentH > 0 ? Math.min(H, cardY + Math.round(cardH * 0.5)) : H);
    const py=photo.preserve?topSafe:0;
    cardPhotoBounds=cover(ctx, photo, 0, py, W, Math.max(1,ph-py));
  } else {
    gradientBg(ctx, W, H, th);
    deco(ctx, W, H, th, "tr");
  }
  const boxes = [];
  if (contentH > 0) {
    if(photo?.preserve)noShadow(ctx);
    else {ctx.shadowColor="rgba(20,18,60,0.22)";ctx.shadowBlur=40;ctx.shadowOffsetY=12;}
    rr(ctx, m, cardY, cardW, cardH, 40);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    noShadow(ctx);
    boxes.push({ role: "card", x: m, y: cardY, w: cardW, h: cardH });
    boxes.push(...drawBlock(ctx, block, m + pad, cardY + pad, "left", maxW));
    let ty = cardY + pad + contentH;
    if (pill) { ty -= pill.h; boxes.push(drawPill(ctx, pill, m + pad, ty, c.pillBg, c.pillInk)); }
    if (price) { ty -= (pill ? PRICE_GAP(tn) : 0) + price.h; boxes.push(drawPill(ctx, price, m + pad, ty, c.pillBg, c.pillInk, "price")); }
  }
  return { fits: block.fits && !(pill && pill.cut) && !(price && price.cut) && (!cardPhotoBounds||cardPhotoBounds.h>=64), boxes, photoFit:cardPhotoBounds?{bounds:cardPhotoBounds,preserved:true,fallback:cardPhotoBounds.h<150?'copy-space':null}:null };
}

// Photo containment and illustration geometry are independent of the text/layout system.
function studioPhoto(ctx, photo, x, y, w, h, p, visual) {
  const inset=16;
  ctx.save();
  ctx.fillStyle=p.paper;
  rr(ctx,x,y,w,h,24);ctx.fill();
  rr(ctx,x,y,w,h,24);ctx.clip();
  let bounds=null;
  if(photo&&visual==='photo') {
    const scale=Math.min(Math.max(1,w-2*inset)/photo.width,Math.max(1,h-2*inset)/photo.height);
    const pw=photo.width*scale,ph=photo.height*scale,px=x+(w-pw)/2,py=y+(h-ph)/2;
    if(photo.enhance)ctx.filter='brightness(1.04) contrast(1.03)';
    ctx.drawImage(photo.source,px,py,pw,ph);
    bounds={x:px,y:py,w:pw,h:ph,scale,sourceWidth:photo.width,sourceHeight:photo.height,contained:true,coverage:pw*ph/(w*h)};
  } else if(isVisualId(visual)) {
    // Isang parisukat na logical box para hindi mabaluktot ang anumang visual sa anumang format.
    const scale=Math.min((w-32)/VISUAL_BOX,(h-32)/VISUAL_BOX);
    const px=x+(w-VISUAL_BOX*scale)/2,py=y+(h-VISUAL_BOX*scale)/2;
    ctx.translate(px,py);ctx.scale(scale,scale);
    drawVisual(ctx,visual,p);
    bounds={x:px,y:py,w:VISUAL_BOX*scale,h:VISUAL_BOX*scale,illustration:true,logicalWidth:VISUAL_BOX,logicalHeight:VISUAL_BOX,scale};
  }
  ctx.restore();
  return bounds;
}
function layoutStudio(ctx,W,H,th,tn,d,photo,fid,opts,preset) {
  const p=palette(preset.category,opts.designStyle,th),pad=72,gap=24;
  ctx.fillStyle=p.paper;ctx.fillRect(0,0,W,H);
  const top=tn.padTop,bottom=H-tn.padBottom,wide=W-2*pad,boxes=[];
  const logo=okPhoto(opts.logo)?opts.logo:null,logoSpace=logo?88:0;
  const brand=fitText(ctx,{key:'business',text:d.business,weight:700,max:34,min:30,lines:2,lh:1.2,color:p.ink},(d.badge?wide*.53:wide)-logoSpace,1);
  const badge=fitPill(ctx,d.badge,tn,wide*.43,{size:28,min:24});
  let y=top;
  if(logo){const scale=Math.min(64/logo.width,64/logo.height),w=logo.width*scale,h=logo.height*scale;ctx.drawImage(logo.source,pad,y,w,h);boxes.push({role:'logo',x:pad,y,w,h});}
  if(d.business)boxes.push(...drawBlock(ctx,{laid:[brand],gap:0},pad+logoSpace,y,'left',wide-logoSpace));
  if(badge)boxes.push(drawPill(ctx,badge,W-pad-badge.w,y,p.accent,p.buttonInk,'badge'));
  if(d.business||badge||logo)y+=Math.max(d.business?brand.h:0,badge?.h||0,logo?64:0)+gap;
  const requested=preset.composition||'stack-photo';
  const stackedFooter=['service-header','stack-copy','type-led'].includes(requested);
  const price=pricePill(ctx,d.price,tn,!stackedFooter&&d.cta?(wide-gap)/2:wide);
  const cta=fitPill(ctx,d.cta,tn,!stackedFooter&&d.price?(wide-gap)/2:wide,{size:36,min:28});
  const contact=d.contact?fitText(ctx,{key:'contact',text:d.contact,weight:500,max:32,min:28,lines:2,lh:1.2,color:p.ink},wide,1):null;
  const actionH=stackedFooter?(price?.h||0)+(cta?.h||0)+(price&&cta?16:0):Math.max(price?.h||0,cta?.h||0);
  const tailH=actionH+(contact?contact.h+(actionH?gap:0):0);
  const copyBottom=bottom-tailH-(tailH?gap:0),availableH=copyBottom-y;
  const visual=opts.serviceVisual||'photo',hasPhoto=!!photo&&visual==='photo',hasVisual=hasPhoto||visual!=='photo';
  const sourceAspect=hasPhoto?photo.width/photo.height:null;
  let composition=requested,fallback=null;
  // A narrow photo is better as a tall, prominent side panel than a tiny image in a wide strip.
  if(hasPhoto&&sourceAspect<1.2&&!requested.startsWith('split')&&requested!=='menu-band'){
    composition=requested==='inset-gallery'?'portrait-gallery':preset.family==='editorial'?'split-left':'split-right';
    if(sourceAspect<.4)fallback='narrow-source';
  }
  const items=[];
  if(d.product)items.push({key:'product',text:d.product,weight:600,max:38,min:32,lines:2,lh:1.18,color:p.ink});
  if(d.headline)items.push({key:'headline',text:d.headline,weight:opts.designStyle==='luxury'?600:800,max:composition.startsWith('split')?92:104,min:48,lines:4,lh:1.06,color:p.ink});
  for(const key of ['detail','offer'])if(d[key])items.push({key,text:d[key],weight:key==='offer'?700:400,max:40,min:30,lines:key==='detail'?3:2,lh:1.25,color:p.muted});
  function plan(kind) {
    let text={x:pad,y,w:wide,h:availableH,align:'left'},image=null;
    if(!hasVisual)return {text,image,kind};
    if(kind==='portrait-gallery'){
      const ph=Math.max(150,availableH*.6),iw=Math.min(wide,Math.max(80,(ph-32)*(sourceAspect||.75)+32));
      image={x:pad+(wide-iw)/2,y,w:iw,h:ph};text={x:pad,y:y+ph+gap,w:wide,h:availableH-ph-gap,align:'center'};
    } else if(kind.startsWith('split')||kind==='menu-band') {
      const imageFraction=hasPhoto?Math.max(.42,Math.min(.53,(sourceAspect||.75)*.68)):.46;
      const iw=Math.round(wide*imageFraction),tw=wide-iw-gap,left=kind==='split-left'||kind==='menu-band';
      image={x:left?pad:pad+tw+gap,y,w:iw,h:availableH};text={x:left?pad+iw+gap:pad,y,w:tw,h:availableH,align:'left'};
    } else {
      const ratio=kind==='service-header'?.25:kind==='inset-gallery'?.45:kind==='type-led'?.34:.4;
      const ph=Math.max(110,Math.min(H*ratio,availableH*.49)),copyH=availableH-ph-gap;
      const copyFirst=['stack-copy','type-led','inset-gallery'].includes(kind);
      image={x:pad,y:copyFirst?y+copyH+gap:y,w:wide,h:ph};
      text={x:pad,y:copyFirst?y:y+ph+gap,w:wide,h:copyH,align:kind==='inset-gallery'?'center':'left'};
      if(kind==='inset-gallery'){image.x+=40;image.w-=80;}
    }
    return {text,image,kind};
  }
  let chosen=plan(composition),block=fitBlock(ctx,items,chosen.text.w,chosen.text.h,Math.round(tn.gap*.65));
  if(!block.fits&&(composition.startsWith('split')||composition==='portrait-gallery')) {
    // Preserve all pixels and exact copy; only use the compact full-width arrangement if it actually fits.
    const alternative=plan(composition==='portrait-gallery'?'split-right':'stack-photo'),candidate=fitBlock(ctx,items,alternative.text.w,alternative.text.h,Math.round(tn.gap*.65));
    if(candidate.fits){chosen=alternative;block=candidate;composition=alternative.kind;fallback='copy-space';}
  }
  let imageBounds=null;
  if(chosen.image){
    const a=chosen.image;imageBounds=studioPhoto(ctx,photo,a.x,a.y,a.w,a.h,p,visual);boxes.push({role:'photo',...a});
    if(hasPhoto&&imageBounds.coverage<.42&&!fallback)fallback='narrow-source';
  }
  // Structural detailing supports the category hierarchy without injecting claims or duplicate photo content.
  if(['menu-band','service-header','type-led'].includes(composition)){
    ctx.fillStyle=p.accent;ctx.fillRect(pad,copyBottom+gap*.4,wide,3);
  }
  const text=chosen.text;
  boxes.push(...drawBlock(ctx,block,text.align==='center'?text.x+text.w/2:text.x,text.y+Math.max(0,(text.h-block.h)/2),text.align,text.w));
  let rowY=bottom-tailH;
  if(stackedFooter){
    if(price){boxes.push(drawPill(ctx,price,pad,rowY,p.accent,p.buttonInk,'price'));rowY+=price.h+(cta?16:0);}
    if(cta)boxes.push(drawPill(ctx,{...cta,w:wide},pad,rowY,p.accent,p.buttonInk,'cta'));
  } else {
    if(price)boxes.push(drawPill(ctx,price,pad,rowY+(actionH-price.h)/2,p.accent,p.buttonInk,'price'));
    if(cta)boxes.push(drawPill(ctx,cta,price?W-pad-cta.w:pad,rowY+(actionH-cta.h)/2,p.accent,p.buttonInk,'cta'));
  }
  if(contact)boxes.push(...drawBlock(ctx,{laid:[contact],gap:0},pad,bottom-contact.h,'left',wide));
  const fits=block.fits&&(!d.business||!brand.cut)&&!badge?.cut&&!price?.cut&&!cta?.cut&&!contact?.cut&&boxes.every(b=>b.x>=0&&b.y>=0&&b.x+b.w<=W+1&&b.y+b.h<=H+1);
  return {fits,boxes,composition,photoFit:{bounds:imageBounds,fallback,sourceAspect,preserved:hasPhoto}};
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
    price: clampText(opts.price, LIMITS.price),
  };
  for(const key of Object.keys(STUDIO_LIMITS))d[key]=clampText(opts[key],LIMITS[key]);
  const preset=has(PRESET_BY_ID,opts.preset)?PRESET_BY_ID[opts.preset]:null;
  const res = preset ? layoutStudio(ctx,W,H,THEMES[tid],TUNE[fid],d,okPhoto(opts.photo)?opts.photo:null,fid,opts,preset) : LAYOUT_FN[lid](ctx, W, H, THEMES[tid], TUNE[fid], d, okPhoto(opts.photo) ? opts.photo : null, fid);
  return { format: fid, layout: lid, theme: tid, width: W, height: H, fits: res.fits, boxes: res.boxes, composition:res.composition||lid, photoFit:res.photoFit||null };
}
