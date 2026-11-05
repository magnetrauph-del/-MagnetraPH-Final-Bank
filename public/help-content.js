// help-content.js - v1 (P1) - laman ng MagnetraPH Help Center (English at Taglish). Walang emoji.
// PURO: walang DOM, walang network, walang storage. Ginagamit ng help.html (buong Help Center) at ng help-sheet.js
// (maliit na "?" sa bawat tool). Totoo lang ang nakasulat: tugma sa kasalukuyang code (hal. 60 minutong auto-logout,
// 15 MB na photo, 3 natapos na gawain para sa Friendly Care, walang ipinapadala ang MagnetraPH).
// Taglish at English lang: walang pekeng Tagalog na bersyon. Kapag kulang ang salin, English ang ipapakita.
// 11 Okt 2026: paksang "privacy" lang (Help Center lang ang nagpapakita nito): "browser na ito sa device mo", tugma sa Privacy Policy.
//
// Ayos ng body (para sa developer): { p } talata, { ol } mga hakbang, { ul } listahan, { qa: [[tanong, sagot]] },
// { links: [[href, text]] } same-site na link lang, { report: true } pindutan ng "Mag-report ng problema".
export const SUPPORT_EMAIL = "support@magnetra.app";

const deepFreeze = (o) => { Object.values(o).forEach((v) => { if (v && typeof v === "object") deepFreeze(v); }); return Object.freeze(o); };

const LEGACY_UI = deepFreeze({
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

const LEGACY_TOPICS = deepFreeze([
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
          "Your Business Profile and settings are saved in this browser on your device.",
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
          "Naka-save sa browser na ito sa device mo ang Business Profile at mga setting mo.",
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
const CURRENT_HELP = [
  {
    "id": "getting-started",
    "keywords": [
      "start",
      "simula",
      "dashboard",
      "projects",
      "gallery",
      "ask"
    ],
    "en": {
      "title": "Getting Started",
      "summary": "Choose a Studio from Home.",
      "body": [
        {
          "p": "MagnetraPH helps you prepare advertising content. It does not guarantee traffic, inquiries, buyers or sales."
        },
        {
          "p": "Home links directly to the working Banner editor. Video production, private project saving, AI assistance and the owner-curated Gallery are not available yet."
        },
        {
          "p": "The Dashboard images are presentation samples, not saved projects or proof of Studio-generated output."
        },
        {
          "ol": [
            "Sign in with your existing email/password or Google account. Verify your email if requested.",
            "On Home, select Create Banner. Keep the editor open while working.",
            "Review your banner and download the PNG. Publish it yourself in your chosen platform."
          ]
        }
      ]
    },
    "fil": {
      "title": "Getting Started",
      "summary": "Pumili ng Studio sa Home.",
      "body": [
        {
          "p": "Tinutulungan ka ng MagnetraPH gumawa ng advertising content. Walang garantisadong traffic, inquiry, buyer o sales."
        },
        {
          "p": "Diretso sa gumaganang Banner editor ang Create Banner. Planned pa ang video production, private project saving, AI assistance at owner-curated Gallery."
        },
        {
          "p": "Presentation samples ang mga larawan sa Dashboard, hindi saved projects o patunay na ginawa ng Studios."
        },
        {
          "ol": [
            "Mag-sign in gamit ang email/password o Google account mo. I-verify ang email kapag hiniling.",
            "Sa Home, piliin ang Create Banner. Panatilihing bukas ang editor habang gumagawa.",
            "I-review at i-download ang PNG. Ikaw ang magpo-post sa platform na pinili mo."
          ]
        }
      ]
    },
    "tl": {
      "title": "Pagsisimula",
      "summary": "Pumili ng Studio mula sa Home.",
      "body": [
        {
          "p": "Tumutulong ang MagnetraPH sa paggawa ng mga patalastas. Hindi nito ginagarantiya ang traffic, mga tanong ng customer, mamimili o benta."
        },
        {
          "p": "Binubuksan ng Create Banner ang gumaganang Banner editor. Hindi pa magagamit ang paggawa ng video, permanenteng pag-save ng project, AI assistant at Gallery na pipiliin ng owner."
        },
        {
          "p": "Mga halimbawang larawan ang nasa Dashboard. Hindi sila mga project mo o patunay ng output mula sa Studios."
        },
        {
          "ol": [
            "Mag-sign in gamit ang email/password o Google account. Kumpirmahin ang email kapag hiniling.",
            "Piliin ang Create Banner sa Home. Panatilihing bukas ang editor habang gumagawa.",
            "Suriin ang Banner at i-download ang PNG. Ikaw ang maglalathala nito sa napiling platform."
          ]
        }
      ]
    }
  },
  {
    "id": "banner",
    "keywords": [
      "banner",
      "png",
      "download",
      "photo",
      "price",
      "layout",
      "format"
    ],
    "en": {
      "title": "Banner Studio",
      "summary": "Create and export a local PNG advertisement.",
      "body": [
        {
          "p": "Pro Max Banner Studio currently opens the existing local Banner editor. It renders your text, chosen layout, colors and optional product photo in the browser; it does not generate AI images."
        },
        {
          "p": "Available PNG sizes are 1080×1080, 1080×1350 and 1080×1920. Check the selected format, price, legibility and cropping before Download."
        },
        {
          "p": "The editor warns before known departures with unsaved edits. Keep editing preserves the current page state. PNG export does not save an editable project."
        },
        {
          "p": "Editable work is not persistently saved. Reloads, crashes or browser termination can lose it. Warnings are not a recovery system."
        }
      ]
    },
    "fil": {
      "title": "Banner Studio",
      "summary": "Gumawa at mag-export ng PNG advertisement sa browser.",
      "body": [
        {
          "p": "Sa existing local Banner editor nagbubukas ang Pro Max Banner Studio. Iri-render nito ang text, layout, colors at optional product photo mo sa browser; hindi ito AI image generation."
        },
        {
          "p": "Available ang 1080×1080, 1080×1350 at 1080×1920 na PNG. I-check ang format, presyo, linaw ng text at cropping bago mag-Download."
        },
        {
          "p": "May warning bago ang kilalang pag-alis kapag may unsaved edits. Pananatiliin ng Keep editing ang laman ng kasalukuyang page. Hindi editable project saving ang PNG export."
        },
        {
          "p": "Hindi permanenteng naka-save ang editable work. Maaari itong mawala sa reload, crash o pagsara ng browser. Hindi recovery system ang warning."
        }
      ]
    },
    "tl": {
      "title": "Banner Studio",
      "summary": "Gumawa at mag-download ng PNG na patalastas sa browser.",
      "body": [
        {
          "p": "Ang Pro Max Banner Studio ay bumubukas sa kasalukuyang Banner editor. Sa browser binubuo ang mga salita, napiling ayos, kulay at larawan ng produkto. Hindi ito gumagawa ng AI image."
        },
        {
          "p": "May PNG na 1080×1080, 1080×1350 at 1080×1920. Suriin ang sukat, presyo, linaw ng mga salita at pagkaputol ng larawan bago mag-Download."
        },
        {
          "p": "May babala bago ang ilang pag-alis kung may hindi pa nase-save na pagbabago. Mananatili ang laman ng page kapag piniling magpatuloy sa pag-edit. Hindi katumbas ng pag-save ng editable project ang PNG export."
        },
        {
          "p": "Hindi permanenteng naitatago ang mga ginagawang project. Maaari silang mawala sa pag-reload, pag-crash o pagsara ng browser. Hindi naibabalik ng babala ang nawalang gawa."
        }
      ]
    }
  },
  {
    "id": "video",
    "keywords": [
      "video",
      "commercial",
      "coming soon",
      "planned",
      "playback"
    ],
    "en": {
      "title": "Video Ads Studio — planned",
      "summary": "Video production is not available.",
      "body": [
        {
          "p": "Pro Video Ads Commercial Studio currently shows availability information and a static concept image. The image cannot play a video."
        },
        {
          "p": "There is no working AI video generation, video hosting or automatic publishing in this release. No release date is promised."
        }
      ]
    },
    "fil": {
      "title": "Video Ads Studio — planned",
      "summary": "Hindi pa available ang video production.",
      "body": [
        {
          "p": "Availability information at static concept image pa lang ang nasa Pro Video Ads Commercial Studio. Hindi playable video ang larawan."
        },
        {
          "p": "Wala pang gumaganang AI video generation, video hosting o automatic publishing sa release na ito. Walang ipinapangakong release date."
        }
      ]
    },
    "tl": {
      "title": "Video Ads Studio — plano pa",
      "summary": "Hindi pa magagamit ang paggawa ng video.",
      "body": [
        {
          "p": "Impormasyon tungkol sa pagiging available at isang larawan lamang ang nasa Pro Video Ads Commercial Studio. Hindi ito naipe-play na video."
        },
        {
          "p": "Wala pang AI video generation, pag-host ng video o awtomatikong paglalathala sa bersyong ito. Wala pang itinakdang petsa ng paglabas."
        }
      ]
    }
  },
  {
    "id": "account",
    "keywords": [
      "account",
      "security",
      "password",
      "name",
      "profile",
      "language",
      "theme",
      "sign out"
    ],
    "en": {
      "title": "Account & Security",
      "summary": "Manage the capabilities already available in Your Account.",
      "body": [
        {
          "p": "My Profile shows your authenticated name, email, sign-in method and email status. Edit display name changes Firebase profile metadata, not your email or Google account name."
        },
        {
          "p": "Preferences offers English, Taglish and Tagalog for Account and Help, plus Light or Dark Mode. Old System preferences are resolved once to Light or Dark. Other legacy screens retain English/Taglish."
        },
        {
          "p": "Password users can change their password after reauthentication. Google-only users manage their Google password with Google."
        },
        {
          "p": "Account deletion requires reauthentication and calls the backend before deleting Firebase sign-in. A failure may leave deletion incomplete; read the error before retrying. It is not a promise about provider logs, backups or email retention."
        },
        {
          "p": "Sign Out redirects only after confirmed Firebase sign-out. If it fails, the session may remain active; follow the message and retry. Never share passwords, tokens or reset/verification links."
        }
      ]
    },
    "fil": {
      "title": "Account & Security",
      "summary": "Gamitin ang available na controls sa Your Account.",
      "body": [
        {
          "p": "Makikita sa My Profile ang authenticated name, email, sign-in method at email status. Firebase display name lang ang binabago ng Edit display name, hindi ang email o Google account name."
        },
        {
          "p": "May English, Taglish at Tagalog sa Account at Help, at Light o Dark Mode sa Preferences. Isang beses lang kino-convert ang lumang System preference sa Light o Dark. English/Taglish pa rin ang ibang legacy screen."
        },
        {
          "p": "Puwedeng magpalit ng password ang password users pagkatapos mag-reauthenticate. Sa Google pinapalitan ng Google-only users ang Google password nila."
        },
        {
          "p": "Kailangan ng reauthentication sa account deletion. Tatawagin muna ang backend bago burahin ang Firebase sign-in. Maaaring hindi matapos ang deletion; basahin ang error bago ulitin. Hindi ito pangako tungkol sa provider logs, backups o email retention."
        },
        {
          "p": "Sa confirmed Firebase sign-out lang lilipat sa Login. Kapag pumalya, maaaring aktibo pa ang session; sundin ang message at subukan ulit. Huwag ibahagi ang password, token o reset/verification links."
        }
      ]
    },
    "tl": {
      "title": "Account at Seguridad",
      "summary": "Pamahalaan ang mga magagamit na bahagi ng Account.",
      "body": [
        {
          "p": "Nasa My Profile ang pangalan, email, paraan ng pag-sign in at katayuan ng email mula sa iyong account. Display name sa Firebase lamang ang mababago, hindi ang email o pangalan sa Google."
        },
        {
          "p": "May English, Taglish at Tagalog sa Account at Help. Light at Dark Mode lamang ang pagpipilian sa itsura. Ang dating System ay isang beses na itinatakda bilang Light o Dark. English o Taglish pa rin ang ilang lumang screen."
        },
        {
          "p": "Kailangang kumpirmahin muli ang pagkakakilanlan bago magpalit ng password. Kung Google lamang ang pag-sign in, sa Google pinapalitan ang password."
        },
        {
          "p": "Kailangan ding mag-sign in muli bago burahin ang account. Nauuna ang kahilingan sa backend bago ang pagbura ng Firebase sign-in. Maaaring hindi ito ganap na matapos. Basahin muna ang error bago ulitin. Walang pangakong awtomatikong nabubura ang lahat ng provider log, backup o email."
        },
        {
          "p": "Lilipas sa Login lamang matapos makumpirma ang pag-sign out sa Firebase. Kung pumalya, maaaring aktibo pa ang session. Subukan muli ayon sa mensahe. Huwag ibigay ang password, token o mga link para sa pag-reset at pagkumpirma."
        }
      ]
    }
  },
  {
    "id": "faq",
    "keywords": [
      "faq",
      "questions",
      "photo",
      "projects",
      "subscription",
      "posting",
      "buyers",
      "save"
    ],
    "en": {
      "title": "Frequently Asked Questions",
      "summary": "What is available, and what is still planned?",
      "body": [
        {
          "qa": [
            [
              "Can I upload a profile photo?",
              "Not yet. A matching supported Google sign-in photo may be shown; otherwise the avatar placeholder remains."
            ],
            [
              "Are my projects saved privately?",
              "Persistent project saving is not available. Keep the editor open and download finished PNG files."
            ],
            [
              "Does MagnetraPH post or find buyers for me?",
              "No. You publish your content yourself. Buyer discovery and automatic posting are not implemented."
            ],
            [
              "Are paid plans or usage credits active?",
              "No verified subscription or billable-usage data is displayed. Do not infer an active plan from the interface."
            ],
            [
              "Is Ask Magnetra responding with AI?",
              "No. AI advertising guidance is planned; the current entry shows Coming Soon."
            ],
            [
              "Can I reset my password?",
              "Use Forgot password on Login. Check your inbox and spam folder. For Google-only sign-in, use Google’s account recovery."
            ]
          ]
        }
      ]
    },
    "fil": {
      "title": "Frequently Asked Questions",
      "summary": "Ano na ang available, at ano ang planned pa?",
      "body": [
        {
          "qa": [
            [
              "Puwede na bang mag-upload ng profile photo?",
              "Hindi pa. Maaaring ipakita ang matching supported Google sign-in photo; kung wala, avatar placeholder ang makikita."
            ],
            [
              "Naka-save ba nang private ang projects ko?",
              "Hindi pa available ang persistent project saving. Panatilihing bukas ang editor at i-download ang tapos na PNG."
            ],
            [
              "Si MagnetraPH ba ang magpo-post at hahanap ng buyer?",
              "Hindi. Ikaw ang magpa-publish ng content mo. Hindi pa implemented ang buyer discovery at automatic posting."
            ],
            [
              "May active paid plans o credits na ba?",
              "Walang verified subscription o billable-usage data na ipinapakita. Huwag mag-assume ng active plan base sa interface."
            ],
            [
              "Sumasagot na ba ng AI ang Ask Magnetra?",
              "Hindi pa. Planned ang AI advertising guidance; Coming Soon ang kasalukuyang entry."
            ],
            [
              "Paano mag-reset ng password?",
              "Gamitin ang Forgot password sa Login. I-check ang inbox at spam folder. Sa Google-only sign-in, gamitin ang Google account recovery."
            ]
          ]
        }
      ]
    },
    "tl": {
      "title": "Mga Madalas Itanong",
      "summary": "Ano ang magagamit na, at ano ang plano pa?",
      "body": [
        {
          "qa": [
            [
              "Maaari bang mag-upload ng sariling larawan sa Profile?",
              "Hindi pa. Maaaring ipakita ang katugmang larawan mula sa suportadong Google sign-in. Kung wala, mananatili ang karaniwang avatar."
            ],
            [
              "Pribado bang naitatago ang mga project ko?",
              "Hindi pa magagamit ang permanenteng pag-save ng project. Panatilihing bukas ang editor at i-download ang natapos na PNG."
            ],
            [
              "Magpo-post ba ang MagnetraPH at hahanap ng mamimili para sa akin?",
              "Hindi. Ikaw ang maglalathala ng ginawa mo. Hindi pa ginagawa ng app ang paghahanap ng mamimili o awtomatikong pag-post."
            ],
            [
              "May bayad na plan o credits na ba?",
              "Walang ipinapakitang nakumpirmang subscription o bayad na paggamit. Huwag ipalagay na may aktibong plan dahil lamang sa nakikita sa screen."
            ],
            [
              "Sumasagot na ba gamit ang AI ang Ask Magnetra?",
              "Hindi pa. Plano pa ang AI na gabay sa patalastas. Coming Soon pa lamang ang makikita."
            ],
            [
              "Paano papalitan ang nakalimutang password?",
              "Piliin ang Forgot password sa Login. Tingnan ang inbox at spam folder. Gamitin ang Google account recovery kung Google lamang ang iyong pag-sign in."
            ]
          ]
        }
      ]
    }
  },
  {
    "id": "troubleshooting",
    "keywords": [
      "troubleshoot",
      "error",
      "login",
      "cors",
      "download",
      "storage",
      "android"
    ],
    "en": {
      "title": "Troubleshooting",
      "summary": "Try safe checks without turning security off.",
      "body": [
        {
          "p": "Use an up-to-date Android browser such as Chrome. Google sign-in may fail inside social-app browsers; open the page in your normal browser."
        },
        {
          "p": "For PNG issues, check the current price and format, then try Download again. Keep a copy before closing the editor."
        },
        {
          "p": "If sign-in or App Check fails on a preview hostname, report the message. Do not disable security checks or assume the preview is authorized."
        },
        {
          "p": "If name saving fails, your typed name stays available for retry while the same account remains open. Reopen My Profile if the account changes."
        },
        {
          "p": "Browser storage restrictions may prevent preferences from persisting. Custom photo storage and editable-project recovery are not available."
        }
      ]
    },
    "fil": {
      "title": "Troubleshooting",
      "summary": "Subukan ang safe checks nang hindi pinapatay ang security.",
      "body": [
        {
          "p": "Gumamit ng updated Android browser gaya ng Chrome. Kapag pumalya ang Google sign-in sa social-app browser, buksan ang page sa normal browser mo."
        },
        {
          "p": "Kung may PNG issue, i-check ang kasalukuyang presyo at format, saka subukan ulit ang Download. Magtabi ng kopya bago isara ang editor."
        },
        {
          "p": "Kung may sign-in o App Check error sa preview hostname, i-report ang message. Huwag i-disable ang security checks o i-assume na authorized ang preview."
        },
        {
          "p": "Kapag pumalya ang name saving, mananatili ang tina-type para sa retry habang bukas ang parehong account. Buksan ulit ang My Profile kapag nagbago ang account."
        },
        {
          "p": "Maaaring hindi ma-persist ang preferences kapag restricted ang browser storage. Wala pang custom photo storage o editable-project recovery."
        }
      ]
    },
    "tl": {
      "title": "Paglutas ng Problema",
      "summary": "Mga ligtas na hakbang na hindi nag-aalis ng seguridad.",
      "body": [
        {
          "p": "Gumamit ng bagong bersyon ng Android browser gaya ng Chrome. Kung hindi gumana ang Google sign-in sa browser sa loob ng social app, buksan ang page sa karaniwang browser."
        },
        {
          "p": "Kung may problema sa PNG, suriin ang kasalukuyang presyo at sukat bago ulitin ang Download. Magtabi ng kopya bago isara ang editor."
        },
        {
          "p": "Iulat ang mensahe kung hindi gumana ang sign-in o App Check sa preview. Huwag alisin ang mga panseguridad na pagsusuri o ipalagay na pinapayagan na ang preview."
        },
        {
          "p": "Kung hindi maitago ang pangalan, mananatili ang isinulat mo para subukan muli habang bukas ang parehong account. Buksan muli ang My Profile kung nagbago ang account."
        },
        {
          "p": "Maaaring hindi manatili ang mga kagustuhan kapag hindi pinapayagan ng browser ang storage. Wala pang imbakan ng sariling larawan o paraan upang ibalik ang editable project."
        }
      ]
    }
  },
  {
    "id": "report",
    "keywords": [
      "help",
      "support",
      "feedback",
      "email",
      "report"
    ],
    "en": {
      "title": "Help & Feedback",
      "summary": "You review and send any support email yourself.",
      "body": [
        {
          "p": "The configured address is support@magnetra.app. The app can prepare a mailto message or let you copy it; it cannot confirm delivery, a monitored inbox or a response time."
        },
        {
          "p": "Support mailbox operation still requires owner confirmation. Never include passwords, tokens, verification links, reset links or customer information."
        },
        {
          "p": "Optional device information is shown first and included only if you choose it."
        },
        {
          "qa": [
            [
              "Where are Privacy and Terms?",
              "Use the links below. Revised trilingual policy drafts require owner review before they replace the published documents."
            ]
          ]
        }
      ]
    },
    "fil": {
      "title": "Help & Feedback",
      "summary": "Ikaw ang magre-review at magse-send ng support email.",
      "body": [
        {
          "p": "support@magnetra.app ang naka-configure na address. Puwedeng gumawa ng mailto message ang app o ipakita ito para makopya. Hindi nito makukumpirma ang delivery, monitored inbox o response time."
        },
        {
          "p": "Kailangan pang kumpirmahin ng owner ang support mailbox. Huwag isama ang password, token, verification/reset link o customer information."
        },
        {
          "p": "Ipinapakita muna ang optional device information at isinasama lang kapag pinili mo."
        },
        {
          "qa": [
            [
              "Nasaan ang Privacy at Terms?",
              "Gamitin ang mga link sa ibaba. Kailangan munang i-review ng owner ang revised trilingual policy drafts bago palitan ang published documents."
            ]
          ]
        }
      ]
    },
    "tl": {
      "title": "Tulong at Feedback",
      "summary": "Ikaw ang susuri at magpapadala ng email.",
      "body": [
        {
          "p": "support@magnetra.app ang nakatakdang address. Maaaring ihanda ng app ang mensahe o ipakita ito upang makopya. Hindi nito nakukumpirma ang paghahatid, pagbabantay sa inbox o oras ng pagsagot."
        },
        {
          "p": "Kailangan pang kumpirmahin ng owner ang pagpapatakbo ng mailbox. Huwag isama ang password, token, verification/reset link o impormasyon ng customer."
        },
        {
          "p": "Makikita muna ang opsyonal na impormasyon ng device. Isasama lamang ito kung pipiliin mo."
        },
        {
          "qa": [
            [
              "Nasaan ang Privacy at Mga Tuntunin?",
              "Gamitin ang mga link sa ibaba. Kailangan munang suriin ng owner ang bagong mga draft sa tatlong wika bago palitan ang kasalukuyang dokumento."
            ]
          ]
        }
      ]
    }
  }
];
export const CENTER_TOPICS = deepFreeze(CURRENT_HELP);
const currentIds = new Set(CURRENT_HELP.map(x => x.id));
export const TOPICS = deepFreeze([...CURRENT_HELP, ...LEGACY_TOPICS.filter(x => !currentIds.has(x.id))]);
export const UI = deepFreeze({ ...LEGACY_UI, tl: { ...LEGACY_UI.fil, title: "Help Center", close: "Isara", privacy: "Privacy Policy", terms: "Mga Tuntunin", openCenter: "Buksan ang Help Center", helpAria: (name) => `Tulong: ${name}` } });

export const LANGS = Object.freeze(["en", "fil", "tl"]);
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
  if (!use.length) return CENTER_TOPICS.slice();
  const scored = CENTER_TOPICS.map((tp) => { const hay = haystack(tp, lang); return [tp, use.filter((w) => hay.includes(w)).length]; });
  const full = scored.filter(([, n]) => n === use.length).map(([tp]) => tp);
  if (full.length || use.length === 1) return full;
  const best = Math.max(...scored.map(([, n]) => n));
  return best > 0 ? scored.filter(([, n]) => n === best).map(([tp]) => tp) : [];
}
