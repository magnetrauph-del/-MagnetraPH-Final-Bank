// help-content.js - v1 (P1) - laman ng MagnetraPH Help Center (English at Taglish). Walang emoji.
// PURO: walang DOM, walang network, walang storage. Ginagamit ng help.html (buong Help Center) at ng help-sheet.js
// (maliit na "?" sa bawat tool). Totoo lang ang nakasulat: tugma sa kasalukuyang code (hal. 60 minutong auto-logout,
// 15 MB na photo, 3 natapos na gawain para sa Friendly Care, walang ipinapadala ang MagnetraPH).
// Taglish at English lang: walang pekeng Tagalog na bersyon. Kapag kulang ang salin, English ang ipapakita.
//
// Ayos ng body (para sa developer): { p } talata, { ol } mga hakbang, { ul } listahan, { qa: [[tanong, sagot]] },
// { links: [[href, text]] } same-site na link lang, { report: true } pindutan ng "Mag-report ng problema".
export const SUPPORT_EMAIL = "support@magnetra.app";

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };

export const UI = deepFreeze({
  en: {
    pageTitle: "MagnetraPH - Help Center",
    eyebrow: "Help",
    title: "Help Center",
    tagline: "Short answers to common questions.",
    back: "Dashboard",
    backAria: "Back to Dashboard",
    langSwitch: "Taglish",
    langSwitchAria: "Show this page in Taglish",
    searchLabel: "Search help",
    searchPh: "Try: banner, PDF, copy, password",
    count: (n) => (n === 1 ? "1 topic" : `${n} topics`),
    none: "Nothing found. Try another word, or report a problem.",
    all: "All topics",
    openCenter: "Open the Help Center",
    sheetMore: "More help",
    close: "Close",
    helpAria: (name) => `Help: ${name}`,
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Email us:",
    stillStuck: "Still stuck?",
    reportOpen: "Report a problem",
  },
  fil: {
    pageTitle: "MagnetraPH - Help Center",
    eyebrow: "Tulong",
    title: "Help Center",
    tagline: "Maiikling sagot sa mga karaniwang tanong.",
    back: "Dashboard",
    backAria: "Bumalik sa Dashboard",
    langSwitch: "English",
    langSwitchAria: "Ipakita ang page na ito sa English",
    searchLabel: "Maghanap sa Help",
    searchPh: "Hal. banner, PDF, copy, password",
    count: (n) => (n === 1 ? "1 paksa" : `${n} na paksa`),
    none: "Walang lumabas. Subukan ang ibang salita, o mag-report ng problema.",
    all: "Lahat ng paksa",
    openCenter: "Buksan ang Help Center",
    sheetMore: "Iba pang tulong",
    close: "Isara",
    helpAria: (name) => `Tulong: ${name}`,
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Mag-email sa:",
    stillStuck: "May problema pa rin?",
    reportOpen: "Mag-report ng problema",
  },
});

export const TOPICS = deepFreeze([
  {
    id: "getting-started",
    keywords: ["start", "begin", "simula", "paano", "how", "intro", "first"],
    en: {
      title: "Getting started",
      summary: "What MagnetraPH can do for you today.",
      body: [
        { p: "MagnetraPH helps with everyday selling: a promo banner, a clear quotation, and the right follow-up message." },
        { ol: [
          "Open the Dashboard.",
          "Under Easy Actions, pick where your business is right now.",
          "Magnetra shows one next step. Tap it to open the right tool.",
          "Make your banner, quotation or message, then save, copy or share it. You send it yourself.",
        ] },
        { p: "Tip: save your Business Profile once, so the tools fill in your business name and contact for you." },
      ],
    },
    fil: {
      title: "Paano magsimula",
      summary: "Ano ang kayang gawin ng MagnetraPH para sa 'yo ngayon.",
      body: [
        { p: "Tinutulungan ka ng MagnetraPH sa araw-araw na pagbebenta: promo banner, malinaw na quotation, at tamang follow-up message." },
        { ol: [
          "Buksan ang Dashboard.",
          "Sa Easy Actions, piliin kung nasaan ka na ngayon sa business mo.",
          "Isang next step ang ituturo ni Magnetra. Pindutin ito para mabuksan ang tamang tool.",
          "Gawin ang banner, quotation o message, saka i-save, i-copy o i-share. Ikaw pa rin ang magse-send.",
        ] },
        { p: "Tip: i-save nang isang beses ang Business Profile mo, para ang tools na ang maglalagay ng pangalan at contact ng business mo." },
      ],
    },
  },
  {
    id: "easy-actions",
    keywords: ["easy", "actions", "next step", "nasaan", "situation", "sitwasyon", "recommend"],
    en: {
      title: "Easy Actions",
      summary: "Pick your situation, get one next step.",
      body: [
        { p: "Easy Actions asks one question: where is your business right now? Pick the closest answer." },
        { ul: [
          "I have a promo: make a banner.",
          "Someone asked the price: make a quotation.",
          "I sent a quote, No reply yet, or Someone bought: get a ready follow-up message.",
          "I need something else: search all tools.",
        ] },
        { p: "Magnetra doesn't guess and doesn't send anything. It shows one next step, and you decide." },
      ],
    },
    fil: {
      title: "Easy Actions",
      summary: "Piliin ang sitwasyon mo, may isang next step.",
      body: [
        { p: "Isang tanong lang ang Easy Actions: Nasaan ka na ngayon sa Business mo? Piliin ang pinakamalapit na sagot." },
        { ul: [
          "May ipo-promote: gumawa ng banner.",
          "May nagtanong ng presyo: gumawa ng quotation.",
          "Nag-send na ng quote, Wala pang sagot, o May bumili na: may handang follow-up message.",
          "Iba ang kailangan ko: hanapin sa lahat ng tools.",
        ] },
        { p: "Hindi nanghuhula at walang sine-send si Magnetra. Isang next step lang ang ituturo niya, at ikaw ang bahala." },
      ],
    },
  },
  {
    id: "banner",
    keywords: ["banner", "promo", "image", "photo", "png", "download", "poster", "larawan", "picture", "save"],
    en: {
      title: "Instant Banner",
      summary: "A simple promo image from your text and photo.",
      body: [
        { ol: [
          "Choose a size, layout and color.",
          "Type your headline (required). Add a detail, business name and contact if you want.",
          "Add a photo if you have one: JPG, PNG or WebP, up to 15 MB.",
          "Tap Save as PNG. The image downloads to your phone.",
        ] },
        { p: "Your text and photo stay on your phone. Nothing is uploaded." },
        { p: "In the Facebook or Messenger browser, downloads may not work. Press and hold the banner to save it, or open magnetra.app in Chrome or Safari." },
      ],
    },
    fil: {
      title: "Instant Banner",
      summary: "Simpleng promo image mula sa text at photo mo.",
      body: [
        { ol: [
          "Piliin ang size, layout at kulay.",
          "I-type ang headline (kailangan). Puwede ring idagdag ang detalye, pangalan ng business at contact.",
          "Magdagdag ng photo kung meron: JPG, PNG o WebP, hanggang 15 MB.",
          "Pindutin ang I-save bilang PNG. Mada-download ang image sa phone mo.",
        ] },
        { p: "Nasa phone mo lang ang text at photo mo. Walang ina-upload." },
        { p: "Sa browser ng Facebook o Messenger, baka hindi gumana ang download. Pindutin nang matagal ang banner para i-save, o buksan ang magnetra.app sa Chrome o Safari." },
      ],
    },
  },
  {
    id: "quote",
    keywords: ["quote", "quotation", "price", "presyo", "pdf", "print", "total", "discount", "diskwento", "item", "resibo"],
    en: {
      title: "Quotation",
      summary: "A clear price list your customer can check.",
      body: [
        { ol: [
          "Fill in your business, your customer, and at least one item with quantity and price.",
          "Add a discount, notes or a validity date if you need them.",
          "Check the preview. Magnetra adds up the total from your numbers.",
          "Tap Save as PDF / Print, or Copy as text, then send it to your customer yourself.",
        ] },
        { p: "Magnetra only uses what you type. It never adds tax or fees by itself." },
        { p: "In the print screen, choose Save as PDF. On iPhone, tap Share, then Save to Files." },
        { p: "After you copy a quotation or open Print, this tab keeps the customer's name, first item, number of items and total for up to 12 hours, so Follow-up can offer them. Closing the tab, logging out, or tapping Remove in Follow-up clears them sooner." },
      ],
    },
    fil: {
      title: "Quotation",
      summary: "Malinaw na presyo na madaling i-check ng customer.",
      body: [
        { ol: [
          "Ilagay ang business mo, ang customer, at kahit isang item na may dami at presyo.",
          "Magdagdag ng diskwento, notes o hanggang kailan valid kung kailangan.",
          "Tingnan ang preview. Si Magnetra ang magkukuwenta ng total mula sa mga numero mo.",
          "Pindutin ang I-save bilang PDF / I-print, o Kopyahin bilang text, saka ikaw ang magse-send sa customer.",
        ] },
        { p: "Ang tina-type mo lang ang ginagamit ni Magnetra. Hindi siya nagdadagdag ng tax o bayad nang kusa." },
        { p: "Sa print screen, piliin ang Save as PDF. Sa iPhone, pindutin ang Share, saka Save to Files." },
        { p: "Pagka-copy ng quotation o pagbukas ng Print, tatandaan ng tab na ito ang pangalan ng customer, unang item, ilang item at total nang hanggang 12 oras, para maialok ng Follow-up. Mas maagang nabubura kapag isinara ang tab, nag-log out, o pinindot ang Alisin sa Follow-up." },
      ],
    },
  },
  {
    id: "followup",
    keywords: ["follow", "followup", "follow-up", "message", "mensahe", "reply", "sagot", "thank", "salamat", "copy", "share", "chat"],
    en: {
      title: "Follow-up Messages",
      summary: "The right words for each step with your customer.",
      body: [
        { ol: [
          "Choose what happened: they asked, you sent a quotation, they're thinking, they stopped replying, or they bought.",
          "Pick the message language: Taglish, Filipino or English.",
          "Tap Other version for a different message. You can also edit it.",
          "Tap Copy (or Share), paste it in your customer's chat, and send it yourself.",
        ] },
        { p: "Add the customer's name, product or a detail in step 3 to make it more personal. If you just made a quotation in this tab, Magnetra offers its details. Nothing is filled in until you tap Use these details." },
        { p: "Magnetra never sends messages for you." },
      ],
    },
    fil: {
      title: "Follow-up Messages",
      summary: "Ang tamang sasabihin sa customer, sa bawat sitwasyon.",
      body: [
        { ol: [
          "Piliin ang nangyari: nagtanong sila, pinadalhan mo ng quotation, pag-iisipan nila, hindi na sila nag-reply, o nakabili na sila.",
          "Piliin ang wika ng message: Taglish, Filipino o English.",
          "Pindutin ang Ibang version para sa ibang message. Puwede mo rin itong i-edit.",
          "Pindutin ang Kopyahin (o I-share), i-paste sa chat ng customer, at ikaw ang magse-send.",
        ] },
        { p: "Para mas personal, ilagay ang pangalan ng customer, produkto o detalye sa step 3. Kung kakagawa mo lang ng quotation sa tab na ito, iaalok ni Magnetra ang detalye nito. Walang ilalagay hangga't hindi mo pinipindot ang Gamitin ang detalye." },
        { p: "Hindi kailanman nagse-send si Magnetra para sa 'yo." },
      ],
    },
  },
  {
    id: "business-profile",
    keywords: ["business", "profile", "shop", "store", "tindahan", "contact", "name", "pangalan"],
    en: {
      title: "Business Profile",
      summary: "Type your business name and contact once.",
      body: [
        { p: "Open Profile, then Business Profile. Save your business name and contact details. Instant Banner and Quotation fill them in for you, and you can still change them in each tool." },
        { p: "It's saved on this phone only and erased when you log out. To remove it now, go to Settings, Privacy and data." },
      ],
    },
    fil: {
      title: "Business Profile",
      summary: "I-type nang isang beses ang pangalan at contact ng business mo.",
      body: [
        { p: "Buksan ang Profile, saka Business Profile. I-save ang pangalan at contact ng business mo. Ilalagay na ito ng Instant Banner at Quotation para sa 'yo, at puwede mo pa rin itong palitan sa bawat tool." },
        { p: "Sa phone na ito lang ito naka-save, at mabubura kapag nag-log out ka. Para burahin ngayon, pumunta sa Settings, Privacy at data." },
      ],
    },
  },
  {
    id: "appearance",
    keywords: ["dark", "night", "light", "theme", "appearance", "itsura", "madilim", "gabi", "mode"],
    en: {
      title: "Appearance and Night Mode",
      summary: "Light, Dark, or the same as your phone.",
      body: [
        { p: "Go to Settings, Appearance. Same as phone follows your phone's dark mode. Light and Dark stay the same whatever your phone uses." },
        { p: "Night Mode uses soft indigo colors that are easier on the eyes at night. Quotations still print on white." },
      ],
    },
    fil: {
      title: "Itsura at Night Mode",
      summary: "Light, Dark, o kapareho ng phone mo.",
      body: [
        { p: "Pumunta sa Settings, Itsura. Ang Kapareho ng phone ay sumusunod sa dark mode ng phone mo. Ang Light at Dark ay hindi nagbabago kahit ano pa ang setting ng phone." },
        { p: "Malambot na kulay-indigo ang Night Mode, para mas magaan sa mata sa gabi. Puti pa rin ang papel kapag nag-print ng quotation." },
      ],
    },
  },
  {
    id: "friendly-care",
    keywords: ["care", "friendly", "rest", "break", "pahinga", "reminder", "paalala", "water"],
    en: {
      title: "Friendly Care",
      summary: "A gentle reminder to rest, only when it's true.",
      body: [
        { p: "After you finish 3 or more tasks in one session (a banner made, a quotation copied, a message copied or shared), the Dashboard may show one short reminder to take a break. At most once per session." },
        { p: "In Follow-up, a water-break note can appear once after 6 messages or about 30 minutes of active use." },
        { p: "No streaks, no pressure. Turn it off anytime in Settings, Friendly Care." },
      ],
    },
    fil: {
      title: "Friendly Care",
      summary: "Malumanay na paalala na magpahinga, kapag totoo lang.",
      body: [
        { p: "Kapag nakatapos ka ng 3 o higit pang gawain sa isang session (nagawang banner, nakopyang quotation, nakopya o na-share na message), puwedeng magpakita ang Dashboard ng isang maikling paalala na magpahinga. Isang beses lang bawat session, pinakamarami." },
        { p: "Sa Follow-up, puwedeng lumabas nang isang beses ang paalalang mag-water break pagkatapos ng 6 na message o mga 30 minutong tuloy-tuloy na paggamit." },
        { p: "Walang streak, walang pressure. Puwede mo itong i-off anumang oras sa Settings, Friendly Care." },
      ],
    },
  },
  {
    id: "language",
    keywords: ["language", "wika", "english", "taglish", "filipino", "tagalog", "translate"],
    en: {
      title: "Language",
      summary: "Taglish or English.",
      body: [
        { p: "Go to Settings, Language, and pick Taglish or English. The Dashboard and the tools follow your choice on this phone." },
        { p: "Follow-up has its own message language (Taglish, Filipino or English), so you can write to each customer the way they talk." },
      ],
    },
    fil: {
      title: "Wika",
      summary: "Taglish o English.",
      body: [
        { p: "Pumunta sa Settings, Wika, at piliin ang Taglish o English. Susunod dito ang Dashboard at ang tools sa phone na ito." },
        { p: "May sariling wika ng message ang Follow-up (Taglish, Filipino o English), para makausap mo ang bawat customer sa paraang sanay sila." },
      ],
    },
  },
  {
    id: "sounds",
    keywords: ["sound", "tunog", "audio", "volume", "mute", "ding"],
    en: {
      title: "Sounds",
      summary: "One soft sound when a task is done. Off at first.",
      body: [
        { p: "Turn it on in Settings, Sounds. You'll hear one short, soft sound when a banner is made, a quotation is copied, or a message is copied or shared. There are no other sounds." },
        { p: "Your phone's volume and silent settings may affect it. The message on the screen always shows too." },
      ],
    },
    fil: {
      title: "Tunog",
      summary: "Isang mahinang tunog kapag tapos na ang gawain. Naka-off sa simula.",
      body: [
        { p: "I-on ito sa Settings, Tunog. Isang maikli at mahinang tunog ang maririnig mo kapag nagawa ang banner, nakopya ang quotation, o nakopya o na-share ang message. Wala nang ibang tunog." },
        { p: "Puwedeng makaapekto ang volume at silent mode ng phone mo. Laging may mensahe rin sa screen." },
      ],
    },
  },
  {
    id: "account",
    keywords: ["account", "password", "login", "log in", "logout", "log out", "delete", "burahin", "verify", "security", "seguridad"],
    en: {
      title: "Account and security",
      summary: "Password, logging out, and deleting your account.",
      body: [
        { ul: [
          "Change password: Settings, Security. If you sign in with Google, you manage your password in your Google Account.",
          "If MagnetraPH stays open with no activity for 60 minutes, it logs you out. Closing the tab or browser does not log you out, so tap Log out on a shared phone.",
          "Logging out also erases your Business Profile and this session's data from that phone.",
          "Delete your account: Settings, at the very bottom. You confirm with your password, or by signing in with Google again. It deletes your login and your profile on our server, and it can't be undone.",
        ] },
      ],
    },
    fil: {
      title: "Account at seguridad",
      summary: "Password, pag-log out, at pagbura ng account.",
      body: [
        { ul: [
          "Palitan ang password: Settings, Seguridad. Kung Google ang gamit mo sa pag-log in, sa Google Account mo pinapalitan ang password.",
          "Kapag bukas ang MagnetraPH at 60 minutong walang galaw, nila-log out ka nito. Hindi ka nala-log out sa pagsara ng tab o browser, kaya pindutin ang Mag-log out sa shared na phone.",
          "Kapag nag-log out, nabubura rin ang Business Profile at ang data ng session na ito sa phone na iyon.",
          "Burahin ang account: Settings, sa pinakababa. Kukumpirmahin mo gamit ang password mo, o sa pag-sign in ulit sa Google. Buburahin nito ang login mo at ang profile mo sa server namin, at hindi na ito maibabalik.",
        ] },
      ],
    },
  },
  {
    id: "privacy",
    keywords: ["privacy", "data", "information", "impormasyon", "saved", "naka-save", "upload", "server", "safe", "ligtas", "tracking"],
    en: {
      title: "How your information is handled",
      summary: "What's saved, where, and how to delete it.",
      body: [
        { ul: [
          "Your account (your email, and your name if you sign in with Google) is kept by Google Firebase Authentication. MagnetraPH's own server keeps only your account ID and email.",
          "Your Business Profile and settings are saved on this phone.",
          "What you make in the tools (banners, photos, quotations, customer names, messages) is not uploaded.",
          "MagnetraPH has no ads and no analytics, and doesn't sell your information. The only outside check is Google reCAPTCHA bot protection.",
        ] },
        { p: "You can delete your account anytime in Settings." },
        { links: [["/privacy.html", "privacy"], ["/terms.html", "terms"]] },
      ],
    },
    fil: {
      title: "Paano hinahawakan ang impormasyon mo",
      summary: "Ano ang naka-save, saan, at paano ito burahin.",
      body: [
        { ul: [
          "Ang account mo (email, at pangalan kung Google ang gamit mo) ay nasa Google Firebase Authentication. ID at email lang ng account ang nasa sariling server ng MagnetraPH.",
          "Nasa phone na ito ang Business Profile at mga setting mo.",
          "Hindi ina-upload ang mga gawa mo sa tools (banner, photo, quotation, pangalan ng customer, message).",
          "Walang ads at walang analytics ang MagnetraPH, at hindi nito ibinebenta ang impormasyon mo. Ang tanging check mula sa labas ay ang Google reCAPTCHA, panlaban sa bot.",
        ] },
        { p: "Puwede mong burahin ang account mo anumang oras sa Settings." },
        { links: [["/privacy.html", "privacy"], ["/terms.html", "terms"]] },
      ],
    },
  },
  {
    id: "report",
    keywords: ["report", "problem", "problema", "bug", "error", "feedback", "suggestion", "contact", "support", "email"],
    en: {
      title: "Report a problem",
      summary: "Tell us what went wrong. You send it from your email.",
      body: [
        { p: "Tap Report a problem here, or in Settings, Help. Choose what it's about and describe what happened. Magnetra opens your email app with the report filled in. You check it and send it yourself." },
        { p: "Device info (like your browser and screen size) is added only if you tick the box, and you see exactly what will be included first." },
        { report: true },
        { p: `You can also email ${SUPPORT_EMAIL}.` },
      ],
    },
    fil: {
      title: "Mag-report ng problema",
      summary: "Sabihin sa amin ang nangyari. Sa email mo ito ise-send.",
      body: [
        { p: "Pindutin ang Mag-report ng problema dito, o sa Settings, Tulong. Piliin kung tungkol saan, at ikuwento ang nangyari. Bubuksan ni Magnetra ang email app mo na may laman na ang report. Ikaw ang magche-check at magse-send." },
        { p: "Ang device info (hal. browser at laki ng screen) ay isasama lang kapag nilagyan mo ng check, at makikita mo muna kung ano mismo ang isasama." },
        { report: true },
        { p: `Puwede ka ring mag-email sa ${SUPPORT_EMAIL}.` },
      ],
    },
  },
  {
    id: "troubleshooting",
    keywords: ["problem", "problema", "not working", "ayaw", "hindi gumagana", "download", "copy", "offline", "messenger", "facebook", "verification", "email", "logged out", "na-log out", "pdf"],
    en: {
      title: "Troubleshooting",
      summary: "Quick fixes for common problems.",
      body: [
        { qa: [
          ["The banner didn't download.", "Tap Download again on the result. In the Facebook or Messenger browser, press and hold the banner to save it, or open magnetra.app in Chrome or Safari."],
          ["Copy doesn't work.", "Some browsers block copying. Magnetra then shows the text in a box: select all of it and copy it yourself."],
          ["I can't save the quotation as PDF.", "App browsers like Facebook or Messenger can't save PDFs. Open magnetra.app in Chrome or Safari. Copy as text still works anywhere."],
          ["I'm in the Facebook or Messenger browser.", "Some things, like Google login, downloads and PDFs, may not work there. Open magnetra.app in Chrome or Safari."],
          ["I'm offline.", "You need internet to log in and open pages. Inside Banner, Quotation and Follow-up you can usually keep working, then reconnect."],
          ["The verification email didn't arrive.", "Check your Spam or Promotions folder. Then log in and tap Send verification email again. Wait a minute between tries."],
          ["I was logged out.", "If MagnetraPH stays open with no activity for 60 minutes, it logs you out. It also logs out when you log out in another tab. Just log in again."],
        ] },
        { p: "Something else? Report a problem and tell us what you tapped and what you saw." },
        { report: true },
      ],
    },
    fil: {
      title: "Kapag may problema",
      summary: "Mabilis na ayos sa mga karaniwang problema.",
      body: [
        { qa: [
          ["Hindi na-download ang banner.", "Pindutin ang I-download ulit sa resulta. Sa browser ng Facebook o Messenger, pindutin nang matagal ang banner para i-save, o buksan ang magnetra.app sa Chrome o Safari."],
          ["Ayaw gumana ng Copy.", "May mga browser na humaharang sa pag-copy. Ipapakita ni Magnetra ang text sa isang box: piliin lahat at ikaw na ang mag-copy."],
          ["Hindi ko ma-save bilang PDF ang quotation.", "Hindi nakakapag-save ng PDF ang browser ng app tulad ng Facebook o Messenger. Buksan ang magnetra.app sa Chrome o Safari. Gumagana pa rin kahit saan ang Kopyahin bilang text."],
          ["Nasa browser ako ng Facebook o Messenger.", "May mga hindi gagana roon, tulad ng Google login, download at PDF. Buksan ang magnetra.app sa Chrome o Safari."],
          ["Offline ako.", "Kailangan ng internet para mag-log in at magbukas ng page. Sa loob ng Banner, Quotation at Follow-up, kadalasan ay puwede kang magtuloy, saka kumonekta ulit."],
          ["Hindi dumating ang verification email.", "I-check ang Spam o Promotions folder mo. Saka mag-log in at pindutin ang Ipadala ulit ang verification email. Maghintay ng isang minuto bago umulit."],
          ["Na-log out ako.", "Kapag bukas ang MagnetraPH at 60 minutong walang galaw, nila-log out ka nito. Nala-log out ka rin kapag nag-log out ka sa ibang tab. Mag-log in lang ulit."],
        ] },
        { p: "Iba ang problema? Mag-report at sabihin kung ano ang pinindot mo at ano ang lumabas." },
        { report: true },
      ],
    },
  },
]);

const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
export const LANGS = Object.freeze(["en", "fil"]);
const pick = (lang) => (LANGS.includes(lang) ? lang : "fil");

export function ui(lang, key, ...args) {
  const set = UI[pick(lang)];
  const v = has(set, key) ? set[key] : UI.en[key];
  return typeof v === "function" ? v(...args) : v ?? "";
}
export const getTopic = (id) => TOPICS.find((x) => x.id === id) || null;
// Laman ng isang paksa sa wikang ito (English kapag kulang)
export function topicText(topic, lang) {
  if (!topic) return null;
  const l = pick(lang);
  return has(topic, l) ? topic[l] : topic.en;
}

/* ---------- Paghahanap (lokal lang; hindi AI, walang network) ---------- */
const fold = (text) => String(text ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, " ").trim();
// Tanong ng user: hanggang 80 character lang (kapareho ng maxlength ng search)
export const normalize = (text) => fold(String(text ?? "").slice(0, 80));
function flatten(block) {
  if (has(block, "p")) return [block.p];
  if (has(block, "ol")) return block.ol;
  if (has(block, "ul")) return block.ul;
  if (has(block, "qa")) return block.qa.flat();
  return [];
}
const STOP = new Set(["how", "do", "does", "to", "the", "my", "can", "is", "it", "what", "why", "an", "of", "in", "on", "for", "and", "or", "me",
  "paano", "pano", "ang", "ng", "sa", "mga", "ko", "mo", "na", "ba", "po", "ako", "yung", "mag", "ma", "nang", "at", "ano", "bakit"]);
function haystack(tp, lang) {
  const parts = [...tp.keywords];
  for (const l of new Set([pick(lang), "en"])) {
    const x = has(tp, l) ? tp[l] : null;
    if (x) parts.push(x.title, x.summary, ...x.body.flatMap(flatten));
  }
  return " " + fold(parts.join(" ")) + " ";
}
// Ibinabalik ang mga paksa na tugma sa LAHAT ng mahalagang salita (sa wikang ito, sa English, at sa keywords).
// Kapag walang tugma sa lahat: ang may pinakamaraming tugmang salita (para may lumabas pa rin kung malapit).
export function searchTopics(query, lang) {
  const all = normalize(query).split(" ").filter((w) => w.length > 1);
  const words = all.filter((w) => !STOP.has(w));
  const use = words.length ? words : all;
  if (!use.length) return TOPICS.slice();
  const scored = TOPICS.map((tp) => { const hay = haystack(tp, lang); return [tp, use.filter((w) => hay.includes(w)).length]; });
  const full = scored.filter(([, n]) => n === use.length).map(([tp]) => tp);
  if (full.length || use.length === 1) return full;
  const best = Math.max(...scored.map(([, n]) => n));
  return best > 0 ? scored.filter(([, n]) => n === best).map(([tp]) => tp) : [];
}
