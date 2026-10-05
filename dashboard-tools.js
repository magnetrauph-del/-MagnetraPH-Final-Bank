// dashboard-tools.js - v3 (Phase 1.1) - listahan ng mga tool ng Dashboard at ng Easy Actions. Walang emoji.
// ANO ANG MERON lang ito (C3): mga grupo, mga tool at ang status nila, Quick Actions, at ang lokal na
// paghahanap ng Ask Magnetra. Walang DOM, walang network, walang storage, walang Firebase, walang login,
// walang presyo o plano. Ang text na ipinapakita ay nasa dashboard-i18n.js (labelKey/descKey);
// ang ui-dashboard.js ang magpapasya kung ano ang mangyayari kapag pinindot.
//
// V1: WALA pang gumaganang tool, kaya lahat ay "roadmap" at walang href.
// Kapag may tool nang gumagana (sariling spec at approval), gawing status: "live" at lagyan ng
// href na same-site path (hal. "/followup.html"); walang user ID o token sa URL.

export const STATUS = Object.freeze({ LIVE: "live", ROADMAP: "roadmap" });

const deepFreeze = (o) => {
  Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); });
  return Object.freeze(o);
};

/* ---------- Apat na grupo (Spec V1, section 7) ---------- */
export const GROUPS = deepFreeze([
  { id: "grow", icon: "i-grow", nameKey: "growName", descKey: "growDesc",
    keywords: { en: ["grow", "marketing", "promote", "promotion", "promo", "advertise", "advertising", "social media", "get customers"],
                fil: ["marketing", "promosyon", "i promote", "makilala", "dagdag customer"] } },
  { id: "sell", icon: "i-sell", nameKey: "sellName", descKey: "sellDesc",
    keywords: { en: ["sell", "selling", "order", "orders", "close a sale"],
                fil: ["benta", "magbenta", "pagbebenta", "order"] } },
  { id: "customers", icon: "i-customers", nameKey: "customersName", descKey: "customersDesc",
    keywords: { en: ["customers", "customer", "clients", "client", "buyers"],
                fil: ["customer", "suki", "mamimili", "kliyente"] } },
  { id: "run", icon: "i-run", nameKey: "runName", descKey: "runDesc",
    keywords: { en: ["run", "operations", "organize", "manage", "admin"],
                fil: ["ayusin", "takbo", "pamamahala", "operasyon"] } },
]);

/* ---------- Mga tool na nakalista sa V1 (pinakamarami: 4 bawat grupo). Lahat ay roadmap. ---------- */
const tool = (id, group, icon, en, fil) => ({
  id, group, status: STATUS.ROADMAP, icon,
  labelKey: `tool.${id}`, descKey: `tool.${id}.desc`,
  keywords: { en, fil },
});

export const TOOLS = deepFreeze([
  tool("marketing-studio", "grow", "i-megaphone",
    ["marketing", "marketing studio", "promo", "promotion", "facebook promo", "facebook post", "campaign", "advertise", "ad"],
    ["promo", "promosyon", "marketing", "patalastas"]),
  { ...tool("instant-banner", "grow", "i-image",
    ["banner", "poster", "flyer", "graphic", "image", "picture", "cover photo", "facebook promo"],
    ["banner", "poster", "karatula", "larawan", "litrato"]), status: STATUS.LIVE, href: "/banner.html" }, // gumagana na (Instant Banner V1)
  tool("content-repurposer", "grow", "i-repeat",
    ["content", "post", "caption", "captions", "repost", "repurpose", "rewrite"],
    ["post", "caption", "nilalaman"]),
  tool("video-ads", "grow", "i-video",
    ["video", "video ad", "reel", "reels", "tiktok", "clip"],
    ["video", "bidyo"]),

  { ...tool("quotes", "sell", "i-quote",
    ["quote", "quotes", "quotation", "quotations", "estimate", "cost estimate"],
    ["quotation", "presyo", "singil", "halaga"]), status: STATUS.LIVE, href: "/quote.html" }, // gumagana na (Quote Maker V1)
  tool("proposals", "sell", "i-proposal",
    ["proposal", "proposals", "pitch", "bid"],
    ["proposal", "panukala", "mungkahi"]),
  tool("catalogs", "sell", "i-catalog",
    ["catalog", "catalogs", "catalogue", "product list", "menu", "lookbook"],
    ["katalogo", "listahan ng produkto", "menu"]),
  tool("offers", "sell", "i-offer",
    ["offer", "offers", "deal", "deals", "discount", "bundle", "voucher", "promo code"],
    ["alok", "diskwento", "bundle"]),

  { ...tool("customer-followup", "customers", "i-mail",
    ["follow up", "followup", "remind customer", "message customer", "email customer", "autoresponder", "thank you message"],
    ["follow up", "paalala", "sundan", "mensahe sa customer"]), status: STATUS.LIVE, href: "/followup.html" }, // gumagana na (Follow-up Messages V1)
  tool("customers", "customers", "i-customers",
    ["customer list", "customers", "contacts", "client list", "clients", "buyers"],
    ["listahan ng customer", "suki", "mamimili", "kliyente"]),
  tool("leads", "customers", "i-userplus",
    ["lead", "leads", "inquiry", "inquiries", "prospect", "prospects", "interested"],
    ["nagtanong", "inquiry", "interesado"]),

  tool("products", "run", "i-box",
    ["product", "products", "item", "items", "add product"],
    ["produkto", "paninda", "item"]),
  tool("inventory", "run", "i-layers",
    ["inventory", "stock", "stocks", "supplies", "warehouse"],
    ["imbentaryo", "stock", "suplay"]),
  tool("documents", "run", "i-file",
    ["document", "documents", "file", "files", "paperwork", "contract", "form", "letter"],
    ["dokumento", "papeles", "kontrata", "sulat"]),
  tool("business-numbers", "run", "i-numbers",
    ["sales", "expenses", "expense", "profit", "numbers", "income", "records", "margin", "receivables", "bookkeeping"],
    ["benta", "gastos", "kita", "tubo", "talaan"]),
]);

/* ---------- Quick Actions (Spec V1, section 6) ----------
   Lalabas lang ang isang Quick Action kapag "live" na ang tool nito. Sa V1, wala pa. */
export const QUICK_ACTIONS = deepFreeze([
  { id: "follow-up", tool: "customer-followup", labelKey: "qa.followUp", order: 1 },
  { id: "create-post", tool: "content-repurposer", labelKey: "qa.createPost", order: 2 },
  { id: "create-banner", tool: "instant-banner", labelKey: "qa.createBanner", order: 3 },
  { id: "make-quote", tool: "quotes", labelKey: "qa.makeQuote", order: 4 },
  { id: "add-customer", tool: "customers", labelKey: "qa.addCustomer", order: 5 },
  { id: "add-product", tool: "products", labelKey: "qa.addProduct", order: 6 },
  { id: "create-video", tool: "video-ads", labelKey: "qa.createVideo", order: 7 },
  { id: "create-document", tool: "documents", labelKey: "qa.createDocument", order: 8 },
]);

/* ---------- Mga Free Tool mo (Dashboard): ang mga "live" na tool lang, ayon sa takbo ng benta ---------- */
const FREE_ORDER = ["instant-banner", "quotes", "customer-followup"];
export const freeTools = () => FREE_ORDER.map((id) => getTool(id)).filter((t) => t && t.status === STATUS.LIVE);

/* ---------- Easy Actions: "Nasaan ka na ngayon sa Business mo?" ----------
   Limang kalagayan ng benta, maikli, at bawat isa ay may iisang rekomendasyon papunta sa tool na gumagana na.
   Pang-anim: "Iba ang kailangan ko" (special: "all-tools"): walang rekomendasyon at walang hula; dinadala lang
   sa All tools na handa na ang search.
   Walang AI, walang network, walang sine-save. Ang "preset" ay salitang galing lang sa listahang ito
   (pinipili lang nito ang sitwasyon sa Follow-up; hindi kailanman ipinapakita bilang text). */
export const FOLLOWUP_PRESETS = Object.freeze(["inquiry", "quote-sent", "thinking", "no-reply", "thank-you"]);
const step = (id, icon, tool, preset, alts = []) => ({
  id, icon, tool, preset,
  labelKey: `easy.${id}`, titleKey: `easy.${id}.title`, textKey: `easy.${id}.text`,
  alts,
});
export const EASY_STEPS = deepFreeze([
  step("promote", "i-megaphone", "instant-banner", null),
  step("price", "i-sell", "quotes", null, [{ tool: "customer-followup", preset: "inquiry", labelKey: "easy.alt.inquiry" }]),
  step("quote-sent", "i-send", "customer-followup", "quote-sent", [{ tool: "customer-followup", preset: "thinking", labelKey: "easy.alt.thinking" }]),
  step("no-reply", "i-clock", "customer-followup", "no-reply"),
  step("bought", "i-heart", "customer-followup", "thank-you"),
  { id: "other", icon: "i-search", tool: null, preset: null, special: "all-tools", labelKey: "easy.other", alts: [] },
]);
export const getEasyStep = (id) => EASY_STEPS.find((s) => s.id === id) || null;

// Same-site na link papunta sa tool (may preset lang kung Follow-up at nasa listahan). null kung hindi pa gumagana ang tool.
export function easyHref(toolId, preset) {
  const tl = getTool(toolId);
  if (!tl || tl.status !== STATUS.LIVE || typeof tl.href !== "string") return null;
  if (toolId === "customer-followup" && FOLLOWUP_PRESETS.includes(preset)) return `${tl.href}?situation=${preset}`;
  return tl.href;
}

/* ---------- Mga Settings na puwedeng hanapin sa Ask Magnetra ----------
   action: metadata lang. Ang ui-dashboard.js ang magbubukas ng tamang bahagi ng Settings;
   hindi ito kailanman direktang nagla-logout o nagbubura ng account. */
const setting = (id, labelKey, en, fil) => ({ id, labelKey, action: { type: "settings", target: id }, keywords: { en, fil } });
// Sariling sheet sa Dashboard (hindi bahagi ng Settings): Business Profile at Help
const sheetEntry = (id, labelKey, sheet, en, fil) => ({ id, labelKey, action: { type: "sheet", target: sheet }, keywords: { en, fil } });
export const SETTINGS_ENTRIES = deepFreeze([
  setting("account", "account", ["account", "my account", "profile", "email", "my name"], ["account", "profile", "pangalan"]),
  setting("language", "language", ["language", "english", "filipino", "tagalog", "taglish", "translate"], ["wika", "lengguwahe", "tagalog", "filipino", "taglish", "ingles"]),
  setting("appearance", "appearance", ["appearance", "dark mode", "dark", "light mode", "theme", "night mode"], ["itsura", "dark mode", "madilim", "maliwanag"]),
  setting("change-password", "changePassword", ["password", "change password", "new password", "reset password"], ["password", "palitan ang password", "bagong password"]),
  setting("delete-account", "deleteAccount", ["delete", "delete account", "delete my account", "remove account", "close account", "deactivate"], ["burahin", "burahin ang account", "tanggalin ang account"]),
  setting("logout", "logout", ["log out", "logout", "sign out", "signout"], ["mag log out", "lumabas"]),
  setting("about", "about", ["about", "version", "about magnetra"], ["tungkol"]),
  sheetEntry("business-profile", "bizProfile", "business",
    ["business profile", "business name", "shop name", "store name", "business contact", "business", "shop"],
    ["pangalan ng business", "pangalan ng tindahan", "negosyo", "tindahan", "business"]),
  sheetEntry("help", "help", "help",
    ["help", "support", "contact support", "how to use", "guide"],
    ["tulong", "suporta", "paano gamitin", "gabay"]),
]);

/* ---------- Mga tanong (puro; walang side effect) ---------- */
const byId = (list, id) => list.find((x) => x.id === id) || null;
export const getGroup = (id) => byId(GROUPS, id);
export const getTool = (id) => byId(TOOLS, id);
export const getSetting = (id) => byId(SETTINGS_ENTRIES, id);

export const toolsInGroup = (groupId) => TOOLS.filter((t) => t.group === groupId);

// Para sa group card: ilan ang handa na, ilan ang paparating, at hanggang 3 tool na ipapakita
export function groupSummary(groupId, peekMax = 3) {
  const list = toolsInGroup(groupId);
  const ready = list.filter((t) => t.status === STATUS.LIVE);
  return { ready: ready.length, soon: list.length - ready.length, peek: list.slice(0, peekMax).map((t) => t.id) };
}

// Quick Actions na may gumaganang tool lang (walang laman sa V1)
export const quickActions = () =>
  QUICK_ACTIONS.filter((q) => getTool(q.tool)?.status === STATUS.LIVE).sort((a, b) => a.order - b.order);

/* ---------- Ask Magnetra V1: lokal na paghahanap gamit ang keywords (hindi AI, walang network) ---------- */
export const MAX_QUERY = 80; // kapareho ng maxlength ng input

const STOP = new Set([
  // English
  "a", "an", "the", "to", "how", "do", "does", "i", "me", "my", "want", "wanna", "where", "is", "are", "can", "could",
  "for", "of", "on", "in", "and", "please", "need", "what", "find", "get", "with", "some", "make", "create", "new",
  // Filipino
  "ang", "ng", "sa", "mga", "ko", "mo", "ka", "ako", "gusto", "kong", "paano", "pano", "gumawa", "gawin", "nasaan", "saan",
  "si", "ni", "na", "at", "para", "po", "ba", "may", "yung", "iyong", "isang", "ano",
]);
const GENERIC = new Set(["tool", "tools", "gamit"]); // "marketing tools" = grupo ang hinahanap

// lowercase, walang accent, letra at numero lang, isang space sa pagitan
export function normalize(text) {
  return String(text ?? "").slice(0, MAX_QUERY).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

// Puntos: bawat salita ng tanong ay binibilang nang isang beses lang (pinakamagandang tugma), at may dagdag
// kapag buong parirala ang tugma (hal. "facebook promo"). Hindi nadodoble kahit pareho ang salita sa EN at FIL.
function scoreEntry(entry, query, tokens) {
  const kws = [...new Set([...entry.keywords.en, ...entry.keywords.fil].map(normalize).filter(Boolean))];
  const phrases = kws.filter((k) => k.includes(" "));
  const words = kws.filter((k) => !k.includes(" "));
  let score = 0;
  for (const p of phrases) if ((" " + query + " ").includes(" " + p + " ")) score += 4;
  for (const tk of tokens) {
    let best = 0;
    for (const kw of words) {
      if (tk === kw) best = Math.max(best, 3);
      else if (kw.length >= 4 && tk.startsWith(kw)) best = Math.max(best, 2);  // hal. "banners"
      else if (tk.length >= 3 && kw.startsWith(tk)) best = Math.max(best, 1);  // hal. "quot"
    }
    score += best;
  }
  return score;
}

const KIND_ORDER = { tool: 0, group: 1, setting: 2 };

// Ibinabalik: [{ kind: "tool" | "group" | "setting", id, score }], pinakamataas muna. Walang ginagawang aksyon.
export function findMatches(query, limit = 5) {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(" ");
  const wantsGroup = words.some((w) => GENERIC.has(w));
  const tokens = words.filter((w) => !STOP.has(w) && !GENERIC.has(w));
  const out = [];
  const add = (kind, list) => list.forEach((e, i) => {
    let s = scoreEntry(e, q, tokens);
    if (s > 0 && kind === "group" && wantsGroup) s += 1;
    if (s > 0) out.push({ kind, id: e.id, score: s, i });
  });
  add("tool", TOOLS);
  add("group", GROUPS);
  add("setting", SETTINGS_ENTRIES);
  out.sort((a, b) => b.score - a.score || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.i - b.i);
  return out.slice(0, Math.max(0, limit)).map(({ kind, id, score }) => ({ kind, id, score }));
}
