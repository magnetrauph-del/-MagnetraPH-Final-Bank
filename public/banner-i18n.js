// Banner Studio language copy: English, Taglish and Tagalog from the existing Preferences key.
// v1.2 (P1): natural na Taglish (photo, style, size, layout) ayon sa taste audit. Walang binagong English.
// Iisang preference ng wika ng buong app ("mgpref_lang"), sa pamamagitan ng frozen login-i18n.js. Walang bagong storage key.
// Default: Filipino/Taglish kapag wala pang piniling wika (local-state.js appLang); English kapag pinili ito.
// Ang text na tina-type ng user para sa banner ay HINDI dumadaan dito at hindi isinasalin.
import { getLang as prefGetLang } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=2"; // Filipino/Taglish kapag wala pang piniling wika
const en = {
  pageTitle: "MagnetraPH - Instant Banner",
  loading: "Loading Instant Banner",
  loaderOffline: "You're offline. Connect to the internet so we can check your login, then reload.",
  appError: "Something went wrong while opening Instant Banner.",
  reload: "Reload",
  back: "Dashboard",
  backAria: "Back to Dashboard",
  offline: "You're offline. You can still make and save your banner.",
  eyebrow: "Grow",
  title: "Instant Banner",
  tagline: "Choose a style, type your text, then save it as an image.",
  step1: "Choose a style",
  format: "Format",
  fmtSquare: "Square",
  fmtPortrait: "Portrait",
  fmtStory: "Story",
  layout: "Layout",
  layCenter: "Centered",
  laySplit: "Photo on top",
  layCard: "Card",
  theme: "Color",
  thIndigo: "Indigo",
  thLavender: "Lavender",
  thCoral: "Coral",
  thTeal: "Teal",
  step2: "Type your text",
  headline: "Headline",
  detail: "Detail line",
  business: "Business name",
  contact: "Contact line",
  price: "Price",
  required: "Required",
  optional: "Optional",
  headlinePh: "What do you want to announce?",
  detailPh: "Add a short detail",
  businessPh: "Your shop or business name",
  contactPh: "Phone, page or how to order",
  pricePh: "e.g. ₱299 each",
  limit: (n) => `Up to ${n} characters.`,
  headlineErr: "Type a headline first.",
  step3: "Add a photo",
  photoAdd: "Add photo",
  photoChange: "Change photo",
  photoRemove: "Remove photo",
  photoReading: "Opening your photo...",
  photoAdded: "Photo added.",
  photoRemoved: "Photo removed.",
  photoType: "This file isn't a JPG, PNG or WebP photo.",
  photoBig: "This photo is larger than 15 MB. Choose a smaller one.",
  photoPixels: "This photo is too large to open here. Choose a smaller copy.",
  photoBad: "This photo can't be opened. Try another one.",
  photoWait: "Your photo is still opening. Try again in a moment.",
  step4: "Preview and save",
  emptyHint: "Type a headline to see your banner here.",
  previewAria: (f, w, h) => `Banner preview: ${f}, ${w} by ${h} pixels.`,
  fitCut: (field) => `${field}: it was too long, so the end was cut. Shorten it to show everything.`,
  fitCutMany: "Some of your text was too long, so the end was cut. Shorten it to show everything.",
  fitTight: "There is not enough room for all your text. Shorten it a little so nothing overlaps.",
  save: "Save as PNG",
  saving: "Making your image...",
  saveFail: "Couldn't make the image. Please try again.",
  privacy: "Your text and photo stay on this device. Nothing is uploaded.",
  resultTitle: "Your banner is ready",
  resultAlt: (h) => `Your banner: ${h}`,
  noteDownload: (f) => `Downloading ${f}. If it doesn't appear, tap Download again, or press and hold the image to save it.`,
  noteSame: "Nothing changed since your last save. Tap Download again for another copy, or press and hold the image to save it.",
  noteInApp: "This app's browser may not save files. Press and hold the image to save it, or open magnetra.app in Chrome or Safari.",
  downloadAgain: "Download again",
  done: "Done",
  fromProfile: "Filled in from your Business Profile. You can change or clear them here.",
  nextTitle: "Next step · optional",
  nextText: "When someone asks the price, you can make a clear quotation.",
  nextLink: "Make a quotation",
  close: "Close",
  exitToast: "Tap back again to leave",
  draftNotice: "Not saved as a project. Keep this editor open to continue editing. Reloading or closing it can lose your work. A PNG export saves an image, not an editable project.",
  leaveTitle: "Leave the Banner editor?",
  leaveDescription: "Your editable work has not been saved as a project. Leaving will discard it, even if you exported a PNG.",
  keepEditing: "Keep editing",
  leaveEditor: "Leave editor",
  leaveUnavailable: "The leave confirmation could not open. Your work is still in this editor. Keep it open to continue editing.",
};
const fil = {
  pageTitle: "MagnetraPH - Instant Banner",
  loading: "Naglo-load ang Instant Banner",
  loaderOffline: "Offline ka. Kumonekta sa internet para ma-check ang login mo, saka i-reload.",
  appError: "May nangyaring mali habang binubuksan ang Instant Banner.",
  reload: "I-reload",
  back: "Dashboard",
  backAria: "Bumalik sa Dashboard",
  offline: "Offline ka. Puwede ka pa ring gumawa at mag-save ng banner.",
  eyebrow: "Grow",
  title: "Instant Banner",
  tagline: "Piliin ang style, i-type ang text mo, saka i-save bilang image.",
  step1: "Piliin ang style",
  format: "Size",
  fmtSquare: "Square",
  fmtPortrait: "Portrait",
  fmtStory: "Story",
  layout: "Layout",
  layCenter: "Nasa gitna",
  laySplit: "Photo sa taas",
  layCard: "Card",
  theme: "Kulay",
  thIndigo: "Indigo",
  thLavender: "Lavender",
  thCoral: "Coral",
  thTeal: "Teal",
  step2: "I-type ang text mo",
  headline: "Headline",
  detail: "Detalye",
  business: "Pangalan ng business",
  contact: "Contact",
  price: "Presyo",
  required: "Kailangan",
  optional: "Opsyonal",
  headlinePh: "Ano ang gusto mong i-promote?",
  detailPh: "Magdagdag ng maikling detalye",
  businessPh: "Pangalan ng tindahan o business mo",
  contactPh: "Numero, page, o paano umorder",
  pricePh: "hal. ₱299 kada piraso",
  limit: (n) => `Hanggang ${n} na character.`,
  headlineErr: "Mag-type muna ng headline.",
  step3: "Magdagdag ng photo",
  photoAdd: "Magdagdag ng photo",
  photoChange: "Palitan ang photo",
  photoRemove: "Alisin ang photo",
  photoReading: "Binubuksan ang photo...",
  photoAdded: "Naidagdag ang photo.",
  photoRemoved: "Naalis ang photo.",
  photoType: "Hindi JPG, PNG o WebP na photo ang file na ito.",
  photoBig: "Lampas 15 MB ang photo na ito. Pumili ng mas maliit.",
  photoPixels: "Masyadong malaki ang photo para mabuksan dito. Pumili ng mas maliit na kopya.",
  photoBad: "Hindi mabuksan ang photo na ito. Subukan ang iba.",
  photoWait: "Binubuksan pa ang photo. Subukan ulit maya-maya.",
  step4: "Tingnan at i-save",
  emptyHint: "Mag-type ng headline para makita dito ang banner mo.",
  previewAria: (f, w, h) => `Preview ng banner: ${f}, ${w} by ${h} pixels.`,
  fitCut: (field) => `${field}: masyadong mahaba, kaya naputol ang dulo. Paikliin para makita ang lahat.`,
  fitCutMany: "May text na masyadong mahaba, kaya naputol ang dulo. Paikliin para makita ang lahat.",
  fitTight: "Kulang ang espasyo para sa lahat ng text. Paikliin nang kaunti para walang magsapawan.",
  save: "I-save bilang PNG",
  saving: "Ginagawa na ang banner mo...",
  saveFail: "Hindi nagawa ang banner. Subukan ulit.",
  privacy: "Nasa device mo lang ang text at photo mo. Walang ina-upload.",
  resultTitle: "Handa na ang banner mo",
  resultAlt: (h) => `Ang banner mo: ${h}`,
  noteDownload: (f) => `Dina-download ang ${f}. Kung hindi lumabas, pindutin ang I-download ulit, o pindutin nang matagal ang banner para i-save.`,
  noteSame: "Walang nagbago mula sa huling save mo. Pindutin ang I-download ulit para sa isa pang kopya, o pindutin nang matagal ang banner para i-save.",
  noteInApp: "Baka hindi makapag-save ng file ang browser ng app na ito. Pindutin nang matagal ang banner para i-save, o buksan ang magnetra.app sa Chrome o Safari.",
  downloadAgain: "I-download ulit",
  done: "Tapos na",
  fromProfile: "Galing sa Business Profile mo. Puwede mo itong palitan o burahin dito.",
  nextTitle: "Next step · opsyonal",
  nextText: "Kapag may nagtanong ng presyo, puwede kang gumawa ng malinaw na quotation.",
  nextLink: "Gumawa ng quotation",
  close: "Isara",
  exitToast: "Pindutin ulit ang Back para umalis",
  draftNotice: "Hindi pa naka-save bilang project. Panatilihing bukas ang editor para makapagpatuloy. Maaaring mawala ang gawa mo kapag nag-reload o nagsara ka. Larawan lang ang PNG, hindi nae-edit na project.",
  leaveTitle: "Aalis sa Banner editor?",
  leaveDescription: "Hindi pa naka-save bilang project ang gawa mo. Mawawala ang nae-edit mong gawa kapag umalis ka, kahit nakapag-export ka ng PNG.",
  keepEditing: "Ituloy ang pag-edit",
  leaveEditor: "Umalis sa editor",
  leaveUnavailable: "Hindi mabuksan ang kumpirmasyon. Nasa editor pa ang gawa mo. Panatilihin itong bukas para makapagpatuloy.",
};
const studioEnglish={
  "pageTitle": "MagnetraPH — Pro Max Banner Studio",
  "loading": "Loading Banner Studio",
  "title": "Pro Max Banner Studio",
  "eyebrow": "Creative Brief",
  "tagline": "Your product. Your words. A ready-to-download banner.",
  "step1": "Photo or service visual",
  "step2": "Product & headline",
  "step3": "Category & design",
  "step4": "Offer & call to action",
  "studioLocal": "Local editor · AI generation planned",
  "visual": "Visual source",
  "enhance": "Gentle brightness & contrast",
  "enhanceHint": "Optional and reversible. It does not recover unreadable labels or change product details.",
  "qualitySmall": "Small photo: fine details may look soft at export size.",
  "qualityExposure": "Check exposure: some details may be too dark or too bright.",
  "qualitySoft": "This photo may be soft or low-detail. It is still accepted.",
  "qualityReview": "Check labels and packaging yourself; this check cannot read them or identify your product.",
  "qualityReady": "Photo checked locally. Review the actual product details before publishing.",
  "product": "Product / service name",
  "productHint": "Required for Studio presets. Original Instant Banner layouts can still export a headline alone.",
  "productRequired": "Add the product or service name for this Studio preset.",
  "pickVisual": "Add a product photo or choose a service illustration for this preset.",
  "category": "Business category",
    "originalLayouts": "Original Instant Banner layouts",
  "designStyle": "Design style",
  "designHint": "Studio presets use your exact text. Changing a preset never replaces your wording.",
  "classicControls": "Format, original layouts & colors",
  "offer": "Offer / promotion",
  "offerHint": "Use only a real offer. Include its conditions; no discount or benefit is invented.",
  "cta": "Call to action",
  "badge": "Badge text",
  "previewTitle": "Preview & Download",
  "packageTitle": "Publishing package",
  "packageHint": "Local text template from your inputs. Review and edit the fields above. Advanced AI copy is planned.",
  "hook": "Hook",
  "caption": "Caption",
  "hashtags": "Hashtags",
  "copyPackage": "Copy package",
  "copied": "Package copied. You choose where to publish it.",
  "copyFail": "Copy is unavailable. Select and copy the text yourself.",
  "packageEmpty": "Add a headline to prepare your publishing text.",
  "reviewNotice": "Check text, prices, cropping and content rights before posting. This editor does not post for you.",
  "limitedChecks": "Basic text checks only. They cannot verify legality, detect every unsafe request or review image content.",
  "blockedIllegal": "Remove illegal-product or exploitative content before exporting.",
  "blockedClaims": "Remove deceptive claims or fabricated testimonials before exporting.",
  "blockedUnsafe": "Remove unsafe or harmful content before exporting.",
  "fitExport": "Some text does not fit. Shorten it or choose another layout before exporting.",
  "copyBlocked": "Review the highlighted content issue before copying or exporting.",
  "studioPresetsHint": "Choose a category, then a layout. Original Instant Banner remains available.",
  "aiPlanned": "AI backgrounds, removal and advanced copy are planned. No paid calls or credits are used here."
};
const studioTaglish={
  "pageTitle": "MagnetraPH — Pro Max Banner Studio",
  "loading": "Binubuksan ang Banner Studio",
  "title": "Pro Max Banner Studio",
  "eyebrow": "Creative Brief",
  "tagline": "Produkto mo, sarili mong mensahe. Ihanda ang banner at i-Download.",
  "step1": "Photo o service visual",
  "step2": "Product at headline",
  "step3": "Category at design",
  "step4": "Offer at call to action",
  "studioLocal": "Local editor · Planned pa ang AI generation",
  "visual": "Visual source",
  "enhance": "Bahagyang liwanag at contrast",
  "enhanceHint": "Optional at puwedeng ibalik sa original. Hindi nito nililinaw ang hindi mabasang label o binabago ang product details.",
  "qualitySmall": "Maliit ang photo: puwedeng lumabo ang maliliit na detalye sa export.",
  "qualityExposure": "I-check ang liwanag: may detalyeng puwedeng masyadong madilim o maliwanag.",
  "qualitySoft": "Puwedeng malambot o kulang sa detalye ang photo. Tanggap pa rin ito.",
  "qualityReview": "Ikaw ang mag-check ng labels at packaging; hindi ito nababasa o nakikilala ng check na ito.",
  "qualityReady": "Na-check ang photo sa device. Suriin ang product details bago mag-post.",
  "product": "Product / service name",
  "productHint": "Kailangan sa Studio presets. Puwede pa ring headline lang sa original Instant Banner layouts.",
  "productRequired": "Ilagay ang product o service name para sa Studio preset na ito.",
  "pickVisual": "Magdagdag ng product photo o pumili ng service illustration para sa preset.",
  "category": "Business category",
    "originalLayouts": "Original Instant Banner layouts",
  "designStyle": "Design style",
  "designHint": "Eksaktong text mo ang gamit ng Studio presets. Hindi pinapalitan ng preset ang sinulat mo.",
  "classicControls": "Format, original layouts at colors",
  "offer": "Offer / promotion",
  "offerHint": "Totoong offer lang ang ilagay, kasama ang conditions. Walang iniimbentong discount o benefit.",
  "cta": "Call to action",
  "badge": "Badge text",
  "previewTitle": "Preview at Download",
  "packageTitle": "Publishing package",
  "packageHint": "Local text template mula sa inputs mo. I-review at i-edit sa fields sa itaas. Planned pa ang advanced AI copy.",
  "hook": "Hook",
  "caption": "Caption",
  "hashtags": "Hashtags",
  "copyPackage": "Copy package",
  "copied": "Nakopya ang package. Ikaw ang pipili kung saan ipo-post.",
  "copyFail": "Hindi makopya rito. Piliin at kopyahin ang text nang manu-mano.",
  "packageEmpty": "Maglagay ng headline para maihanda ang publishing text.",
  "reviewNotice": "I-check ang text, presyo, cropping at content rights bago mag-post. Hindi nagpo-post ang editor para sa iyo.",
  "limitedChecks": "Basic text checks lang. Hindi nito nabe-verify ang legality, lahat ng unsafe requests o image content.",
  "blockedIllegal": "Alisin ang illegal-product o exploitative content bago mag-export.",
  "blockedClaims": "Alisin ang misleading claims o pekeng testimonials bago mag-export.",
  "blockedUnsafe": "Alisin ang unsafe o nakapipinsalang content bago mag-export.",
  "fitExport": "Hindi kasya ang ilang text. Paikliin o pumili ng ibang layout bago mag-export.",
  "copyBlocked": "I-review muna ang content issue bago mag-copy o mag-export.",
  "studioPresetsHint": "Pumili ng category at layout. Available pa rin ang original Instant Banner.",
  "aiPlanned": "Planned pa ang AI backgrounds, removal at advanced copy. Walang paid calls o credits na ginagamit dito."
};
const studioTagalog={
  "pageTitle": "MagnetraPH — Pro Max Banner Studio",
  "loading": "Binubuksan ang Banner Studio",
  "title": "Pro Max Banner Studio",
  "eyebrow": "Creative Brief",
  "tagline": "Produkto mo, sarili mong mensahe. Ihanda ang banner at i-Download.",
  "step1": "Larawan o service visual",
  "step2": "Produkto at headline",
  "step3": "Category at disenyo",
  "step4": "Alok at call to action",
  "studioLocal": "Local editor · Planned pa ang AI generation",
  "visual": "Visual source",
  "enhance": "Bahagyang liwanag at contrast",
  "enhanceHint": "Opsyonal at maaaring ibalik sa orihinal. Hindi nito nababasa ang malabong label o binabago ang detalye ng produkto.",
  "qualitySmall": "Maliit ang larawan: maaaring lumabo ang maliliit na detalye sa export.",
  "qualityExposure": "Suriin ang liwanag: maaaring may detalyeng masyadong madilim o maliwanag.",
  "qualitySoft": "Maaaring malabo o kulang sa detalye ang larawan. Tinatanggap pa rin ito.",
  "qualityReview": "Ikaw ang susuri sa mga label at packaging; hindi ito nababasa o nakikilala ng pagsusuring ito.",
  "qualityReady": "Nasuri ang larawan sa device. Suriin ang detalye ng produkto bago mag-post.",
  "product": "Product / service name",
  "productHint": "Kailangan sa Studio presets. Maaari pa ring headline lamang sa orihinal na Instant Banner layouts.",
  "productRequired": "Ilagay ang pangalan ng produkto o serbisyo para sa Studio preset na ito.",
  "pickVisual": "Magdagdag ng larawan ng produkto o pumili ng service illustration para sa preset.",
  "category": "Business category",
    "originalLayouts": "Original Instant Banner layouts",
  "designStyle": "Design style",
  "designHint": "Eksaktong text mo ang gamit ng Studio presets. Hindi pinapalitan ng preset ang isinulat mo.",
  "classicControls": "Format, original layouts at colors",
  "offer": "Offer / promotion",
  "offerHint": "Tunay na alok lamang ang ilagay, kasama ang mga kondisyon. Walang iniimbentong diskuwento o benepisyo.",
  "cta": "Call to action",
  "badge": "Badge text",
  "previewTitle": "Preview at Download",
  "packageTitle": "Publishing package",
  "packageHint": "Inihandang text mula sa inilagay mo. Suriin at baguhin sa mga field sa itaas. Plano pa ang advanced AI copy.",
  "hook": "Hook",
  "caption": "Caption",
  "hashtags": "Hashtags",
  "copyPackage": "Copy package",
  "copied": "Nakopya ang package. Ikaw ang pipili kung saan ito ipo-post.",
  "copyFail": "Hindi makopya rito. Piliin at kopyahin ang text nang manu-mano.",
  "packageEmpty": "Maglagay ng headline upang maihanda ang publishing text.",
  "reviewNotice": "Suriin ang text, presyo, cropping at content rights bago mag-post. Hindi nagpo-post ang editor para sa iyo.",
  "limitedChecks": "Payak na pagsusuri ng text lamang. Hindi nito natitiyak ang legalidad, lahat ng mapanganib na kahilingan o laman ng larawan.",
  "blockedIllegal": "Alisin ang ilegal na produkto o mapagsamantalang content bago mag-export.",
  "blockedClaims": "Alisin ang mapanlinlang na pahayag o pekeng testimonials bago mag-export.",
  "blockedUnsafe": "Alisin ang mapanganib o nakapipinsalang content bago mag-export.",
  "fitExport": "Hindi kasya ang ilang text. Paikliin o pumili ng ibang layout bago mag-export.",
  "copyBlocked": "Suriin muna ang problema sa content bago mag-copy o mag-export.",
  "studioPresetsHint": "Pumili ng category at layout. Maaari pa ring gamitin ang orihinal na Instant Banner.",
  "aiPlanned": "Plano pa ang AI backgrounds, removal at advanced copy. Walang bayad na tawag o credits na ginagamit dito."
};
studioEnglish.needsPreset="Choose a Studio preset to apply Studio text, style or service visuals. Clear those additions to use an original layout.";
studioTaglish.needsPreset="Pumili ng Studio preset para sa Studio text, style o service visuals. Alisin ang mga dagdag na ito kung original layout ang gagamitin.";
studioTagalog.needsPreset="Pumili ng Studio preset para sa Studio text, disenyo o service visuals. Alisin ang mga dagdag na ito kung orihinal na layout ang gagamitin.";
Object.assign(studioEnglish,{
  "tagline": "",
  "draftNotice": "Not saved as a project. Download your PNG before leaving; reloading or closing can lose editable work.",
  "studioLocal": "Local editor · AI planned",
  "navVisual": "1 Visual",
  "navMessage": "2 Message",
  "navDesign": "3 Design",
  "navOffer": "4 Offer",
  "enhanceHint": "Optional and reversible. Unreadable details cannot be restored.",
  "qualityReady": "Photo ready. Check product details before posting.",
  "qualityReview": "Check labels yourself; they are not read automatically.",
  "designHint": "Presets change the layout, not your words.",
  "productHint": "Required for Studio presets. Original layouts also support headline-only banners.",
  "studioPresetsHint": "Choose a category and preset.",
  "packageHint": "Copy made locally from your inputs. Review before posting. AI copy is planned.",
  "inspect": "Inspect / Zoom",
  "inspectTitle": "Inspect Banner",
  "inspectHint": "Fit shows the whole banner. Use 100% or 200% and scroll to inspect text and product details.",
  "inspectFit": "Fit",
  "inspectActual": "100%",
  "inspectZoom": "200%",
  "inspectClose": "Close inspection",
  "photoFallback": "The full image is preserved. This source needs extra space; try a less narrow photo or shorten the text.",
  "notesTitle": "About this editor",
  "save": "Download Banner",
  "downloadAgain": "Download Banner",
  "copyMarketing": "Copy Marketing Package",
  "otherTools": "Other tools",
  "noteSame": "Your PNG is ready. Use Download Banner for another copy.",
  "previewTitle": "Preview & Download"
});
Object.assign(studioTaglish,{
  "tagline": "",
  "draftNotice": "Hindi pa naka-save bilang project. I-Download ang PNG bago umalis; puwedeng mawala ang editable work kapag nag-reload o nagsara.",
  "studioLocal": "Local editor · Planned pa ang AI",
  "navVisual": "1 Visual",
  "navMessage": "2 Message",
  "navDesign": "3 Design",
  "navOffer": "4 Offer",
  "enhanceHint": "Optional at puwedeng ibalik. Hindi nito mababasa ang malabong detalye.",
  "qualityReady": "Handa ang photo. I-check ang product details bago mag-post.",
  "qualityReview": "Ikaw ang mag-check ng labels; hindi ito awtomatikong nababasa.",
  "designHint": "Layout lang ang binabago ng presets, hindi ang text mo.",
  "productHint": "Kailangan sa Studio presets. Puwede ring headline lang sa original layouts.",
  "studioPresetsHint": "Pumili ng category at preset.",
  "packageHint": "Copy mula sa inputs mo. I-review bago mag-post. Planned pa ang AI copy.",
  "inspect": "Inspect / Zoom",
  "inspectTitle": "Inspect Banner",
  "inspectHint": "Buong banner ang makikita sa Fit. Gamitin ang 100% o 200% at mag-scroll para masuri ang text at product details.",
  "inspectFit": "Fit",
  "inspectActual": "100%",
  "inspectZoom": "200%",
  "inspectClose": "Isara ang inspection",
  "photoFallback": "Buong image ang pinanatili. Kailangan nito ng dagdag na espasyo; subukan ang hindi gaanong makitid na photo o paikliin ang text.",
  "notesTitle": "Tungkol sa editor",
  "save": "Download Banner",
  "downloadAgain": "Download Banner",
  "copyMarketing": "Copy Marketing Package",
  "otherTools": "Other tools",
  "noteSame": "Handa ang PNG. Gamitin ang Download Banner para sa isa pang kopya.",
  "previewTitle": "Preview at Download"
});
Object.assign(studioTagalog,{
  "tagline": "",
  "draftNotice": "Hindi pa naka-save bilang project. I-Download ang PNG bago umalis; maaaring mawala ang editable na gawa sa pag-reload o pagsara.",
  "studioLocal": "Local editor · Plano pa ang AI",
  "navVisual": "1 Visual",
  "navMessage": "2 Message",
  "navDesign": "3 Design",
  "navOffer": "4 Offer",
  "enhanceHint": "Opsyonal at maaaring ibalik. Hindi nito mababasa ang malabong detalye.",
  "qualityReady": "Handa ang larawan. Suriin ang detalye ng produkto bago mag-post.",
  "qualityReview": "Ikaw ang susuri sa mga label; hindi ito awtomatikong nababasa.",
  "designHint": "Layout lamang ang binabago ng presets, hindi ang text mo.",
  "productHint": "Kailangan sa Studio presets. Maaari ring headline lamang sa orihinal na layouts.",
  "studioPresetsHint": "Pumili ng category at preset.",
  "packageHint": "Text mula sa inilagay mo. Suriin bago mag-post. Plano pa ang AI copy.",
  "inspect": "Inspect / Zoom",
  "inspectTitle": "Inspect Banner",
  "inspectHint": "Buong banner ang makikita sa Fit. Gamitin ang 100% o 200% at mag-scroll upang masuri ang text at detalye ng produkto.",
  "inspectFit": "Fit",
  "inspectActual": "100%",
  "inspectZoom": "200%",
  "inspectClose": "Isara ang inspection",
  "photoFallback": "Buong larawan ang pinanatili. Kailangan nito ng dagdag na espasyo; subukan ang hindi gaanong makitid na larawan o paikliin ang text.",
  "notesTitle": "Tungkol sa editor",
  "save": "Download Banner",
  "downloadAgain": "Download Banner",
  "copyMarketing": "Copy Marketing Package",
  "otherTools": "Other tools",
  "noteSame": "Handa ang PNG. Gamitin ang Download Banner para sa isa pang kopya.",
  "previewTitle": "Preview at Download"
});
studioEnglish.noteDownload=()=>"Your PNG is ready. Use Download Banner to save it, or press and hold the image if downloads are blocked.";
studioTaglish.noteDownload=()=>"Handa ang PNG. Gamitin ang Download Banner, o pindutin nang matagal ang image kung hindi gumagana ang download.";
studioTagalog.noteDownload=()=>"Handa ang PNG. Gamitin ang Download Banner, o pindutin nang matagal ang image kung hindi gumagana ang download.";
studioEnglish.inspectionFail="Inspection could not open. Your work is still in the editor. Try again.";
studioTaglish.inspectionFail="Hindi mabuksan ang inspection. Nasa editor pa ang gawa mo. Subukan ulit.";
studioTagalog.inspectionFail="Hindi mabuksan ang inspection. Nasa editor pa ang gawa mo. Subukan muli.";
studioEnglish.pngNotice="A PNG saves an image, not an editable project.";
studioTaglish.pngNotice="Image ang PNG, hindi editable project.";
studioTagalog.pngNotice="Larawan ang PNG, hindi editable project.";
Object.assign(en,studioEnglish);Object.assign(fil,studioTaglish);
const tl={...fil,...studioTagalog,headline:"Headline",detail:"Supporting text",business:"Business name",contact:"Contact line",price:"Price",required:"Kailangan",optional:"Opsyonal",headlineErr:"Maglagay muna ng headline.",photoAdd:"Magdagdag ng larawan",photoChange:"Palitan ang larawan",photoRemove:"Alisin ang larawan",photoReading:"Binubuksan ang larawan...",photoAdded:"Naidagdag ang larawan.",photoRemoved:"Naalis ang larawan.",save:"Download Banner",saving:"Ginagawa ang larawan...",saveFail:"Hindi nagawa ang larawan. Subukan muli.",keepEditing:"Keep editing",leaveEditor:"Leave editor",leaveTitle:"Leave the Banner editor?",leaveDescription:"Hindi pa naka-save bilang project ang gawa mo. Mawawala ito sa pag-alis kahit may PNG ka na.",draftNotice:studioTagalog.draftNotice,privacy:"Sa device lang pinoproseso ang text at larawan. Hindi ito ina-upload ng editor."};
Object.assign(en,{
  "wizardBack": "Back",
  "wizardProduct": "Product",
  "wizardMessage": "Message",
  "wizardDesign": "Design",
  "wizardOffer": "Offer & CTA",
  "wizardContinue": "Continue",
  "wizardGenerate": "Generate Preview",
  "wizardProductHint": "Add your product photo, or choose a visual for your service.",
  "wizardMessageHint": "Keep your message clear and your price exact.",
  "wizardOfferHint": "Add a real offer and tell customers what to do next.",
  "wizardServiceVisual": "Or choose a service visual",
  "wizardLogo": "Brand logo (optional)",
  "wizardAddLogo": "Add logo",
  "wizardRemoveLogo": "Remove logo",
  "wizardLogoReady": "Logo added.",
  "wizardLogoRemoved": "Logo removed.",
  "wizardProductPh": "e.g. Premium burger",
  "wizardHeadlinePh": "e.g. Freshly made, just for you",
  "wizardPrice": "Price (optional)",
  "wizardRecommended": "Recommended layouts",
    "wizardPromotion": "Promotion (optional)",
  "wizardOfferPh": "e.g. Lunch combo available until 2 PM",
  "wizardNoCta": "No CTA",
  "wizardShop": "Shop now",
  "wizardOrder": "Order now",
  "wizardContact": "Message us",
  "wizardBook": "Book now",
  "wizardLearn": "Learn more",
  "wizardCustom": "Custom text",
  "wizardCustomCta": "Your exact CTA",
  "wizardAspect": "Banner aspect ratio",
  "wizardAdvanced": "Advanced customization",
  "wizardDeviceNotice": "Local preview · AI generation planned. Editable work is not saved; download your PNG before leaving.",
  "wizardPreview": "Banner Preview",
  "wizardEdit": "Edit",
  "wizardInvalidVisual": "Choose a photo or service visual."
});
Object.assign(fil,{
  "wizardBack": "Back",
  "wizardProduct": "Product",
  "wizardMessage": "Message",
  "wizardDesign": "Design",
  "wizardOffer": "Offer & CTA",
  "wizardContinue": "Continue",
  "wizardGenerate": "Generate Preview",
  "wizardProductHint": "Idagdag ang product photo mo o pumili ng visual para sa service.",
  "wizardMessageHint": "Gawing malinaw ang mensahe at eksakto ang presyo.",
  "wizardOfferHint": "Maglagay ng totoong offer at malinaw na susunod na gagawin ng customer.",
  "wizardServiceVisual": "O pumili ng service visual",
  "wizardLogo": "Brand logo (optional)",
  "wizardAddLogo": "Add logo",
  "wizardRemoveLogo": "Remove logo",
  "wizardLogoReady": "Naidagdag ang logo.",
  "wizardLogoRemoved": "Naalis ang logo.",
  "wizardProductPh": "Hal. Premium burger",
  "wizardHeadlinePh": "Hal. Bagong luto, para sa iyo",
  "wizardPrice": "Price (optional)",
  "wizardRecommended": "Recommended layouts",
    "wizardPromotion": "Promotion (optional)",
  "wizardOfferPh": "Hal. Lunch combo hanggang 2 PM",
  "wizardNoCta": "Walang CTA",
  "wizardShop": "Shop now",
  "wizardOrder": "Order now",
  "wizardContact": "Message us",
  "wizardBook": "Book now",
  "wizardLearn": "Learn more",
  "wizardCustom": "Sariling text",
  "wizardCustomCta": "Eksaktong CTA mo",
  "wizardAspect": "Banner aspect ratio",
  "wizardAdvanced": "Advanced customization",
  "wizardDeviceNotice": "Local preview · Planned pa ang AI. Hindi naka-save ang editable work; i-Download ang PNG bago umalis.",
  "wizardPreview": "Banner Preview",
  "wizardEdit": "Edit"
});
Object.assign(tl,{
  "wizardBack": "Back",
  "wizardProduct": "Product",
  "wizardMessage": "Message",
  "wizardDesign": "Design",
  "wizardOffer": "Offer & CTA",
  "wizardContinue": "Continue",
  "wizardGenerate": "Generate Preview",
  "wizardProductHint": "Magdagdag ng larawan ng produkto o pumili ng visual para sa serbisyo.",
  "wizardMessageHint": "Panatilihing malinaw ang mensahe at eksakto ang presyo.",
  "wizardOfferHint": "Maglagay ng tunay na alok at malinaw na susunod na gagawin ng customer.",
  "wizardServiceVisual": "O pumili ng service visual",
  "wizardLogo": "Brand logo (opsyonal)",
  "wizardAddLogo": "Add logo",
  "wizardRemoveLogo": "Remove logo",
  "wizardLogoReady": "Naidagdag ang logo.",
  "wizardLogoRemoved": "Naalis ang logo.",
  "wizardProductPh": "Hal. Premium burger",
  "wizardHeadlinePh": "Hal. Bagong luto, para sa iyo",
  "wizardPrice": "Price (opsyonal)",
  "wizardRecommended": "Mga inirerekomendang layout",
    "wizardPromotion": "Promotion (opsyonal)",
  "wizardOfferPh": "Hal. Lunch combo hanggang 2 PM",
  "wizardNoCta": "Walang CTA",
  "wizardShop": "Shop now",
  "wizardOrder": "Order now",
  "wizardContact": "Message us",
  "wizardBook": "Book now",
  "wizardLearn": "Learn more",
  "wizardCustom": "Sariling text",
  "wizardCustomCta": "Eksaktong CTA mo",
  "wizardAspect": "Banner aspect ratio",
  "wizardAdvanced": "Advanced customization",
  "wizardDeviceNotice": "Local preview · Plano pa ang AI. Hindi naka-save ang editable work; i-Download ang PNG bago umalis.",
  "wizardPreview": "Banner Preview",
  "wizardEdit": "Edit"
});
for(const strings of [en,fil,tl])strings.wizardStepCount=n=>`${n} / 4`;
// Clickable step indicators at photo-first na visual: isang pinagmumulan lang ng larawan sa banner.
Object.assign(en,{
});
Object.assign(fil,{
});
Object.assign(tl,{
});
Object.assign(en,{"wizardStepDone":"complete","wizardStepTodo":"not finished"});
Object.assign(fil,{"wizardStepDone":"kumpleto","wizardStepTodo":"hindi pa tapos"});
Object.assign(tl,{"wizardStepDone":"kumpleto","wizardStepTodo":"hindi pa tapos"});
// Service Visual Library: dalawang mode at ang category picker.
Object.assign(en,{
  "visualCategory":"Business type",
  "famSpotlight":"Spotlight","famPattern":"Pattern","famScene":"Framed",
});
Object.assign(fil,{
  "visualCategory":"Uri ng negosyo",
  "famSpotlight":"Spotlight","famPattern":"Pattern","famScene":"Naka-frame",
});
Object.assign(tl,{
  "visualCategory":"Uri ng negosyo",
  "famSpotlight":"Spotlight","famPattern":"Pattern","famScene":"Naka-frame",
});
en.wizardStepGo=(n,name)=>`Step ${n}: ${name}`;
fil.wizardStepGo=(n,name)=>`Step ${n}: ${name}`;
tl.wizardStepGo=(n,name)=>`Hakbang ${n}: ${name}`;
Object.assign(en,{
  "wizardHelpTitle": "Banner Studio Help",
  "wizardHelpProduct": "Add a photo or choose an illustration for a service. A brand logo is optional.",
  "wizardHelpMessage": "Enter your product name, exact headline and optional price.",
  "wizardHelpDesign": "Choose a category and a recommended layout, or use See All for all 8 layouts.",
  "wizardHelpOffer": "Add your offer and CTA, choose a size, then Generate Preview. Inspect before selecting Download Banner.",
  "wizardHelpMore": "Help Center"
});
Object.assign(fil,{
  "wizardHelpTitle": "Banner Studio Help",
  "wizardHelpProduct": "Magdagdag ng photo o pumili ng illustration para sa service. Optional ang brand logo.",
  "wizardHelpMessage": "Ilagay ang product name, eksaktong headline at optional na presyo.",
  "wizardHelpDesign": "Pumili ng category at recommended layout. Nasa See All ang lahat ng 8 layout.",
  "wizardHelpOffer": "Idagdag ang offer at CTA, pumili ng size, saka Generate Preview. I-check muna bago piliin ang Download Banner.",
  "wizardHelpMore": "Help Center"
});
Object.assign(tl,{
  "wizardHelpTitle": "Banner Studio Help",
  "wizardHelpProduct": "Magdagdag ng larawan o pumili ng illustration para sa serbisyo. Opsyonal ang brand logo.",
  "wizardHelpMessage": "Ilagay ang pangalan ng produkto, eksaktong headline at opsyonal na presyo.",
  "wizardHelpDesign": "Pumili ng kategorya at inirerekomendang layout. Nasa See All ang lahat ng 8 na layout.",
  "wizardHelpOffer": "Idagdag ang alok at CTA, pumili ng sukat, saka Generate Preview. Suriin muna bago piliin ang Download Banner.",
  "wizardHelpMore": "Help Center"
});
Object.assign(en,{
  "photoAdd": "Upload product photo",
  "tutorialTitle": "Quick Tutorial",
  "tutorialStart": "Quick Tutorial — Create Your First Banner",
  "tutorialIntro": "Optional guidance using the real editor. Skip or replay whenever you need.",
  "tutorialSkip": "Skip",
  "tutorialNext": "Next",
  "tutorialFinish": "Finish",
  "tipTitle1": "Start With Your Product",
  "tutorialProduct": "Add a clear product photo or choose a suitable service visual. Include your brand logo to keep your marketing materials recognizable and consistent.",
  "tipTitle2": "Build Your Marketing Message",
  "tutorialMessage": "Enter your product or service name, write a compelling headline, and include your exact selling price when applicable. Keep every claim accurate and relevant to your offer.",
  "tipTitle3": "Design Your Banner",
  "tutorialDesign": "Select your business category, then explore layouts and design styles that complement your product, message, and brand.",
  "tipTitle4": "Present Your Offer",
  "tutorialOffer": "Highlight a genuine promotion if available, choose the action you want customers to take, and select the appropriate banner format for your publishing channel.",
  "tipTitle5": "Review Your Marketing Package",
  "tutorialPreview": "Inspect the banner at Fit, 100% or 200%, then check that the product and offer details match exactly what you entered. Review the hook, caption, CTA and hashtags under Publishing package: these are assembled from your own inputs, not written for you. Download the PNG and copy the text, then post them yourself on the channel you choose.",
  "helpFaqTitle": "Help & FAQs",
  "helpFaqIntro": "Reference answers and practical fixes, whenever you need them.",
  "faqPhotosTitle": "Photos, quality & logo",
  "faqPhotosBody": "Use a JPG, PNG or WebP up to 15 MB. A clear photo with the whole product visible works best. Mildly blurry photos are accepted, but unreadable labels cannot be recovered. Review packaging and details yourself. A logo is optional. The reversible brightness and contrast control is in Advanced customization; it does not invent product details.",
  "faqHeadlineTitle": "Writing a truthful headline",
  "faqHeadlineBody": "Name the product or service and focus on one clear message. Use exact prices and only claims you can support. Avoid guaranteed results, invented benefits or endorsements. Your wording is rendered as text; it is not replaced by AI copy.",
  "faqCategoriesTitle": "Categories, search & presets",
  "faqCategoriesBody": "Pick the business type that fits what you sell, such as Food, Beauty or Clothing, not your promotion. There are 21 categories. The category sets the colours and the three recommended layouts; See All opens the full catalogue of 8 layouts. Changing category keeps your brief and only moves the layout when the old one is not among the new three. The four Theme Colors in Step 4 change the banner only when Design Style is Theme Colors; the other five styles set their own colours.",
  "faqOfferTitle": "Promotion & CTA examples",
  "faqOfferBody": "A promotion is optional. Enter only an offer you really provide, including relevant conditions. Use Order now for orders, Book now for appointments, or your own exact CTA. Put offer wording here in Step 4, rather than in category search.",
  "faqSizesTitle": "Sizes & preview zoom",
  "faqSizesBody": "Square is 1080 × 1080, Portrait is 1080 × 1350, and Story is 1080 × 1920. Fit shows the whole banner. At 100% or 200%, scroll inside the preview to inspect text, prices and packaging. Zoom does not add image detail.",
  "faqExportTitle": "Editing & PNG download",
  "faqExportBody": "Generate Preview renders locally without a paid AI call. Use Edit to return to a chosen step without losing the current brief. Download Banner exports the banner as a PNG. A PNG is an image, not an editable project. Review the exact text and content rights before posting it yourself.",
  "faqPackageTitle": "What Copy Marketing Package includes",
  "faqPackageBody": "It copies a hook, caption, CTA and product-name hashtags prepared from your inputs. The caption can include the product, headline, supporting text, offer, price, business and contact details you entered. It does not invent benefits or automatically post to social platforms. If copying is unavailable, expand Publishing package and copy the text yourself.",
  "faqWorkTitle": "Unsaved work & privacy",
  "faqWorkBody": "Editable projects are not persistently saved or synced to an account. Keep this editor open while working. Reloading, closing the browser or a crash can lose the brief and images. Finish and download your PNG before leaving. The exit confirmation helps with supported navigation; it cannot prevent every loss. The editor processes your selected photos and logo on this device without uploading them.",
  "faqProblemsTitle": "Common problems & fixes",
  "faqProblemsBody": "If a file will not open, check its format and 15 MB limit or choose another photo. A smaller copy may help on a slow device. If text does not fit, shorten it or choose another preset. Remove misleading or unsafe wording when a content check flags it; keyword checks are limited and do not verify image content. If an embedded browser blocks downloads, open the editor in your normal browser before starting, or use the PNG image-saving fallback when shown."
});
Object.assign(fil,{
  "photoAdd": "Mag-upload ng product photo",
  "tutorialTitle": "Quick Tutorial",
  "tutorialStart": "Quick Tutorial — Create Your First Banner",
  "tutorialIntro": "Optional na gabay gamit ang tunay na editor. Puwedeng i-skip o ulitin kapag kailangan.",
  "tutorialSkip": "Skip",
  "tutorialNext": "Next",
  "tutorialFinish": "Finish",
  "tipTitle1": "Magsimula sa Produkto Mo",
  "tutorialProduct": "Magdagdag ng malinaw na product photo o pumili ng bagay na service visual. Isama ang logo ng brand mo para manatiling madaling makilala at magkatugma ang mga marketing material mo.",
  "tipTitle2": "Buuin ang Marketing Message Mo",
  "tutorialMessage": "Ilagay ang pangalan ng produkto o serbisyo, gumawa ng nakakahikayat na headline, at isama ang eksaktong presyo kung mayroon. Panatilihing tama at tugma sa offer mo ang bawat sinasabi.",
  "tipTitle3": "I-disenyo ang Banner Mo",
  "tutorialDesign": "Piliin ang business category mo, saka tingnan ang mga layout at design style na bagay sa produkto, mensahe at brand mo.",
  "tipTitle4": "Iprisinta ang Offer Mo",
  "tutorialOffer": "Itampok ang tunay na promo kung meron, piliin ang aksyong gusto mong gawin ng customer, at piliin ang tamang banner format para sa pagla-post mo.",
  "tipTitle5": "I-review ang Marketing Package Mo",
  "tutorialPreview": "Tingnan ang banner sa Fit, 100% o 200%, saka tiyakin na tugma sa inilagay mo ang detalye ng produkto at offer. I-review ang hook, caption, CTA at hashtags sa ilalim ng Publishing package: tinipon ang mga ito mula sa inilagay mo mismo, hindi ito isinulat para sa iyo. I-download ang PNG at i-copy ang text, saka ikaw na ang mag-post sa channel na pipiliin mo.",
  "helpFaqTitle": "Help & FAQs",
  "helpFaqIntro": "Mga sagot at praktikal na solusyon kapag may tanong ka.",
  "faqPhotosTitle": "Photos, quality & logo",
  "faqPhotosBody": "Gumamit ng JPG, PNG o WebP hanggang 15 MB. Mas maganda ang malinaw na photo na kita ang buong produkto. Tanggap ang bahagyang malabong photo, pero hindi nito mababasa ang malabong labels. Ikaw ang mag-check ng packaging at detalye. Optional ang logo. Nasa Advanced customization ang brightness at contrast na puwedeng ibalik; hindi ito nag-iimbento ng product details.",
  "faqHeadlineTitle": "Paano gumawa ng tapat na headline",
  "faqHeadlineBody": "Banggitin ang produkto o service at tumuon sa isang malinaw na mensahe. Gumamit ng eksaktong presyo at claims na kaya mong patunayan. Iwasan ang guaranteed results, imbentong benefits o endorsements. Eksaktong text mo ang inilalagay sa banner; hindi ito pinapalitan ng AI copy.",
  "faqCategoriesTitle": "Categories, search & presets",
  "faqCategoriesBody": "Piliin ang business type na bagay sa tinda mo, gaya ng Food, Beauty o Clothing, hindi ang promo. May 21 categories. Ang category ang nagtatakda ng kulay at ng tatlong recommended layout; nasa See All ang buong 8 layout. Hindi nawawala ang brief kapag nagpalit ka ng category, at lumilipat lang ang layout kung wala na ito sa bagong tatlo. Ang apat na Theme Colors sa Step 4 ay nagpapalit ng banner kapag Theme Colors lang ang Design Style; may sariling kulay ang limang iba.",
  "faqOfferTitle": "Mga halimbawa ng promo at CTA",
  "faqOfferBody": "Optional ang promo. Ilagay lang ang totoong offer mo, kasama ang mahahalagang conditions. Puwede ang Order now para sa orders, Book now para sa appointments, o sarili mong eksaktong CTA. Sa Step 4 ilagay ang offer, hindi sa category search.",
  "faqSizesTitle": "Sizes & preview zoom",
  "faqSizesBody": "1080 × 1080 ang Square, 1080 × 1350 ang Portrait, at 1080 × 1920 ang Story. Buong banner ang ipinapakita ng Fit. Sa 100% o 200%, mag-scroll sa loob ng preview para ma-check ang text, presyo at packaging. Hindi nagdadagdag ng detalye ang zoom.",
  "faqExportTitle": "Pag-edit at PNG download",
  "faqExportBody": "Local render ang Generate Preview at walang paid AI call. Gamitin ang Edit para bumalik sa napiling step nang hindi nawawala ang kasalukuyang brief. PNG ang export ng Download Banner. Image ito, hindi editable project. I-check ang text at karapatan sa content bago ikaw mismo ang mag-post.",
  "faqPackageTitle": "Ano ang laman ng Copy Marketing Package",
  "faqPackageBody": "Kinokopya nito ang hook, caption, CTA at hashtags mula sa product name, gamit ang inputs mo. Maaaring kasama sa caption ang product, headline, supporting text, offer, presyo, business at contact details na inilagay mo. Hindi ito nag-iimbento ng benefits o awtomatikong nagpo-post. Kung hindi makopya, buksan ang Publishing package at kopyahin ang text nang manu-mano.",
  "faqWorkTitle": "Unsaved work & privacy",
  "faqWorkBody": "Hindi pa permanenteng naka-save o account-synced ang editable projects. Panatilihing bukas ang editor habang gumagawa. Puwedeng mawala ang brief at images kapag nag-reload, nagsara ang browser o nag-crash. Tapusin at i-Download ang PNG bago umalis. Tumutulong ang exit confirmation sa suportadong navigation, pero hindi nito napipigilan ang lahat ng pagkawala. Sa device lang pinoproseso ang photos at logo; hindi ito ina-upload ng editor.",
  "faqProblemsTitle": "Karaniwang problema at solusyon",
  "faqProblemsBody": "Kung ayaw bumukas ng file, i-check ang format at 15 MB limit o pumili ng ibang photo. Puwedeng makatulong ang mas maliit na kopya sa mabagal na device. Kung hindi kasya ang text, paikliin ito o pumili ng ibang preset. Alisin ang misleading o unsafe wording kapag na-flag; limitado ang keyword checks at hindi nito nabe-verify ang image content. Kung naka-block ang download sa embedded browser, gamitin ang normal browser bago magsimula, o ang PNG image-saving fallback kapag ipinakita."
});
Object.assign(tl,{
  "photoAdd": "Mag-upload ng larawan ng produkto",
  "tutorialTitle": "Quick Tutorial",
  "tutorialStart": "Quick Tutorial — Create Your First Banner",
  "tutorialIntro": "Opsyonal na gabay gamit ang mismong editor. Maaaring i-skip o ulitin kapag kailangan.",
  "tutorialSkip": "Skip",
  "tutorialNext": "Next",
  "tutorialFinish": "Finish",
  "tipTitle1": "Magsimula sa Produkto Mo",
  "tutorialProduct": "Magdagdag ng malinaw na larawan ng produkto o pumili ng angkop na service visual. Isama ang logo ng negosyo mo para manatiling madaling makilala at magkatugma ang mga materyales mo sa pagmemerkado.",
  "tipTitle2": "Buuin ang Mensahe sa Pagmemerkado",
  "tutorialMessage": "Ilagay ang pangalan ng produkto o serbisyo, sumulat ng nakakahikayat na headline, at isama ang eksaktong halaga kung mayroon. Panatilihing tumpak at may kaugnayan sa alok mo ang bawat pahayag.",
  "tipTitle3": "Idisenyo ang Banner Mo",
  "tutorialDesign": "Piliin ang kategorya ng negosyo mo, saka tuklasin ang mga layout at estilo ng disenyo na bagay sa produkto, mensahe at negosyo mo.",
  "tipTitle4": "Ipakita ang Alok Mo",
  "tutorialOffer": "Itampok ang tunay na promo kung mayroon, piliin ang kilos na gusto mong gawin ng kostumer, at piliin ang tamang sukat ng banner para sa paglalabas mo.",
  "tipTitle5": "Suriin ang Marketing Package Mo",
  "tutorialPreview": "Tingnan ang banner sa Fit, 100% o 200%, saka tiyakin na tugma sa inilagay mo ang mga detalye ng produkto at alok. Suriin ang hook, caption, CTA at hashtags sa ilalim ng Publishing package: tinipon ang mga ito mula sa inilagay mo mismo, hindi ito isinulat para sa iyo. I-download ang PNG at kopyahin ang teksto, saka ikaw na ang maglalabas nito sa pipiliin mong channel.",
  "helpFaqTitle": "Help & FAQs",
  "helpFaqIntro": "Mga sagot at praktikal na solusyon kapag may tanong ka.",
  "faqPhotosTitle": "Mga larawan, quality at logo",
  "faqPhotosBody": "Gumamit ng JPG, PNG o WebP hanggang 15 MB. Mas mainam ang malinaw na larawan na kita ang buong produkto. Tinatanggap ang bahagyang malabong larawan, pero hindi nito nababasa ang malabong label. Ikaw ang susuri sa packaging at detalye. Opsyonal ang logo. Nasa Advanced customization ang brightness at contrast na maaaring ibalik; hindi ito nag-iimbento ng detalye ng produkto.",
  "faqHeadlineTitle": "Pagsulat ng tapat na headline",
  "faqHeadlineBody": "Banggitin ang produkto o serbisyo at tumuon sa isang malinaw na mensahe. Gumamit ng eksaktong presyo at mga pahayag na kaya mong patunayan. Iwasan ang garantisadong resulta, imbentong benepisyo o endorsements. Eksaktong text mo ang inilalagay sa banner; hindi ito pinapalitan ng AI copy.",
  "faqCategoriesTitle": "Categories, search at presets",
  "faqCategoriesBody": "Piliin ang uri ng negosyong bagay sa iyong tinda, gaya ng pagkain, beauty o damit, hindi ang promo. May 21 kategorya. Ang kategorya ang nagtatakda ng kulay at ng tatlong inirerekomendang layout; nasa See All ang buong 8 na layout. Hindi nawawala ang brief kapag nagpalit ka ng kategorya, at lumilipat lamang ang layout kung wala na ito sa bagong tatlo. Ang apat na Theme Colors sa Step 4 ay nagpapalit ng banner kapag Theme Colors lamang ang Design Style; may sariling kulay ang limang iba.",
  "faqOfferTitle": "Mga halimbawa ng promo at CTA",
  "faqOfferBody": "Opsyonal ang promo. Ilagay lamang ang tunay na alok mo, kasama ang mahahalagang kondisyon. Maaaring Order now para sa orders, Book now para sa appointments, o sarili mong eksaktong CTA. Sa Step 4 ilagay ang alok, hindi sa category search.",
  "faqSizesTitle": "Mga sukat at preview zoom",
  "faqSizesBody": "1080 × 1080 ang Square, 1080 × 1350 ang Portrait, at 1080 × 1920 ang Story. Buong banner ang ipinapakita ng Fit. Sa 100% o 200%, mag-scroll sa loob ng preview para suriin ang text, presyo at packaging. Hindi nagdadagdag ng detalye ang zoom.",
  "faqExportTitle": "Pag-edit at PNG download",
  "faqExportBody": "Sa device ginagawa ang Generate Preview at walang bayad na AI call. Gamitin ang Edit para bumalik sa napiling step nang hindi nawawala ang kasalukuyang brief. PNG ang export ng Download Banner. Larawan ito, hindi editable project. Suriin ang text at karapatan sa content bago ikaw mismo ang mag-post.",
  "faqPackageTitle": "Ano ang laman ng Copy Marketing Package",
  "faqPackageBody": "Kinokopya nito ang hook, caption, CTA at hashtags mula sa pangalan ng produkto, gamit ang inilagay mo. Maaaring kasama sa caption ang produkto, headline, supporting text, alok, presyo, business at contact details mo. Hindi ito nag-iimbento ng benepisyo o awtomatikong nagpo-post. Kung hindi makopya, buksan ang Publishing package at kopyahin ang text nang manu-mano.",
  "faqWorkTitle": "Hindi pa naka-save na gawa at privacy",
  "faqWorkBody": "Hindi pa permanenteng naka-save o naka-sync sa Account ang editable projects. Panatilihing bukas ang editor habang gumagawa. Maaaring mawala ang brief at mga larawan kapag nag-reload, nagsara ang browser o nag-crash. Tapusin at i-Download ang PNG bago umalis. Tumutulong ang exit confirmation sa suportadong navigation, pero hindi nito napipigilan ang lahat ng pagkawala. Sa device lamang pinoproseso ang mga larawan at logo; hindi ito ina-upload ng editor.",
  "faqProblemsTitle": "Karaniwang problema at solusyon",
  "faqProblemsBody": "Kung hindi bumubukas ang file, suriin ang format at 15 MB limit o pumili ng ibang larawan. Maaaring makatulong ang mas maliit na kopya sa mabagal na device. Kung hindi kasya ang text, paikliin ito o pumili ng ibang preset. Alisin ang mapanlinlang o mapanganib na pahayag kapag na-flag; limitado ang keyword checks at hindi nito nasusuri ang laman ng larawan. Kung naka-block ang download sa embedded browser, gamitin ang karaniwang browser bago magsimula, o ang PNG image-saving fallback kapag ipinakita."
});
// Tatlong pamuhatan ng Step 1: i-upload, o gumamit ng visual, pagkatapos pumili ng disenyo.
Object.assign(en,{"step1Upload":"Upload a product photo","step1OrVisual":"Or use a Service Visual","step1PickDesign":"Choose a design"});
Object.assign(fil,{"step1Upload":"Mag-upload ng product photo","step1OrVisual":"O gumamit ng Service Visual","step1PickDesign":"Pumili ng disenyo"});
// Walong tunay na layout, ang pangalan nila at ang anim na design style - isinalin.
Object.assign(en,{"layoutRecommendedTag":"Recommended","layoutSplitLeft":"Split Feature","layoutSplitLeftDetail":"Photo left, text right","layoutMenuBand":"Menu Split","layoutMenuBandDetail":"Photo left, text right, accent line","layoutSplitRight":"Split Reverse","layoutSplitRightDetail":"Photo right, text left","layoutStackPhoto":"Photo Header","layoutStackPhotoDetail":"Photo on top, text below","layoutServiceHeader":"Slim Banner","layoutServiceHeaderDetail":"Slim photo on top, text below","layoutStackCopy":"Text First","layoutStackCopyDetail":"Text on top, photo below","layoutTypeLed":"Text First Accent","layoutTypeLedDetail":"Text on top, photo below, accent line","layoutInsetGallery":"Inset Gallery","layoutInsetGalleryDetail":"Text on top, framed photo below","styleCategory":"Category palette","styleBrand":"Your theme colour","styleMinimal":"Minimal \u2014 off-white","styleLuxury":"Refined \u2014 dark and gold","styleBold":"Bold \u2014 deep violet","styleTropical":"Natural \u2014 green","wizardSeeAll":"See all layouts \u00b7 8","wizardSeeLess":"Show recommended only","needsPreset":"Choose a layout."});
Object.assign(fil,{"layoutRecommendedTag":"Recommended","layoutSplitLeft":"Split Feature","layoutSplitLeftDetail":"Product photo sa kaliwa, details sa kanan","layoutMenuBand":"Menu Split","layoutMenuBandDetail":"Product photo sa kaliwa, details sa kanan, may accent line","layoutSplitRight":"Split Reverse","layoutSplitRightDetail":"Product photo sa kanan, details sa kaliwa","layoutStackPhoto":"Photo Header","layoutStackPhotoDetail":"Main photo sa itaas, details sa ibaba","layoutServiceHeader":"Slim Banner","layoutServiceHeaderDetail":"Slim photo sa itaas, details sa ibaba","layoutStackCopy":"Text First","layoutStackCopyDetail":"Main message sa itaas, photo sa ibaba","layoutTypeLed":"Text First Accent","layoutTypeLedDetail":"Main message sa itaas, photo sa ibaba, may accent line","layoutInsetGallery":"Inset Gallery","layoutInsetGalleryDetail":"Main message sa itaas, framed photo sa ibaba","styleCategory":"Category Palette","styleBrand":"Theme Colors","styleMinimal":"Minimal — Off-White","styleLuxury":"Refined — Dark & Gold","styleBold":"Bold — Deep Violet","styleTropical":"Natural — Green","wizardSeeAll":"Lahat ng layout \u00b7 8","wizardSeeLess":"Recommended layouts lang","needsPreset":"Pumili ng layout."});
Object.assign(tl,{"layoutRecommendedTag":"Recommended","layoutSplitLeft":"Split Feature","layoutSplitLeftDetail":"Product photo sa kaliwa, details sa kanan","layoutMenuBand":"Menu Split","layoutMenuBandDetail":"Product photo sa kaliwa, details sa kanan, may accent line","layoutSplitRight":"Split Reverse","layoutSplitRightDetail":"Product photo sa kanan, details sa kaliwa","layoutStackPhoto":"Photo Header","layoutStackPhotoDetail":"Main photo sa itaas, details sa ibaba","layoutServiceHeader":"Slim Banner","layoutServiceHeaderDetail":"Slim photo sa itaas, details sa ibaba","layoutStackCopy":"Text First","layoutStackCopyDetail":"Main message sa itaas, photo sa ibaba","layoutTypeLed":"Text First Accent","layoutTypeLedDetail":"Main message sa itaas, photo sa ibaba, may accent line","layoutInsetGallery":"Inset Gallery","layoutInsetGalleryDetail":"Main message sa itaas, framed photo sa ibaba","styleCategory":"Kulay ng kategorya","styleBrand":"Kulay ng tema mo","styleMinimal":"Simple \u2014 mapusyaw na puti","styleLuxury":"Pino \u2014 madilim at ginto","styleBold":"Matapang \u2014 malalim na lila","styleTropical":"Natural \u2014 berde","wizardSeeAll":"Lahat ng layout \u00b7 8","wizardSeeLess":"Recommended layouts lang","needsPreset":"Pumili ng layout."});
Object.assign(tl,{"step1Upload":"Mag-upload ng larawan ng produkto","step1OrVisual":"O gumamit ng Service Visual","step1PickDesign":"Pumili ng disenyo"});

// Ang 21 business category, isinalin. Wala nang search field, kaya ang label mismo
// ang kailangang mabasa sa sariling wika ng gumagamit.
Object.assign(en,{"catEcommerce":"E-commerce","catFood":"Food & Drinks","catBeauty":"Beauty & Personal Care","catFashion":"Fashion & Apparel","catLuxury":"Luxury & Collectibles","catElectronics":"Electronics & Technology","catHome":"Home & Living","catServices":"Professional & Local Services","catProperty":"Property & Real Estate","catFitness":"Fitness & Wellness","catEducation":"Education & Training","catTravel":"Travel & Hospitality","catAutomotive":"Automotive & Transport","catAgriculture":"Agriculture & Farming","catPets":"Pets & Animal Care","catEvents":"Events & Celebrations","catGrocery":"Grocery & Essentials","catB2b":"B2B & Industrial","catDigital":"Digital Products & Software","catArts":"Arts & Handmade","catOther":"Other / Custom Business"});
Object.assign(fil,{"catEcommerce":"E-commerce","catFood":"Pagkain at Inumin","catBeauty":"Beauty at Personal Care","catFashion":"Damit at Fashion","catLuxury":"Luxury at Collectibles","catElectronics":"Electronics at Technology","catHome":"Bahay at Kagamitan","catServices":"Professional at Local Services","catProperty":"Property at Real Estate","catFitness":"Fitness at Wellness","catEducation":"Edukasyon at Training","catTravel":"Travel at Hospitality","catAutomotive":"Sasakyan at Transport","catAgriculture":"Agrikultura at Pagsasaka","catPets":"Alagang Hayop","catEvents":"Events at Okasyon","catGrocery":"Grocery at Pangunahing Bilihin","catB2b":"B2B at Industrial","catDigital":"Digital Products at Software","catArts":"Sining at Gawang Kamay","catOther":"Iba pa / Custom na Negosyo"});
Object.assign(tl,{"catEcommerce":"Tindahang Online","catFood":"Pagkain at Inumin","catBeauty":"Kagandahan at Pansariling Pangangalaga","catFashion":"Damit at Kasuotan","catLuxury":"Marangya at Koleksiyon","catElectronics":"Elektroniko at Teknolohiya","catHome":"Tahanan at Pamumuhay","catServices":"Propesyonal at Lokal na Serbisyo","catProperty":"Ari-arian at Real Estate","catFitness":"Kalusugan at Pag-eehersisyo","catEducation":"Edukasyon at Pagsasanay","catTravel":"Paglalakbay at Pagtanggap","catAutomotive":"Sasakyan at Transportasyon","catAgriculture":"Agrikultura at Pagsasaka","catPets":"Alagang Hayop","catEvents":"Mga Okasyon at Pagdiriwang","catGrocery":"Groserya at Pangunahing Bilihin","catB2b":"B2B at Industriyal","catDigital":"Digital na Produkto at Software","catArts":"Sining at Gawang Kamay","catOther":"Iba pa / Sariling Negosyo"});

// Step 4 - Offer at CTA. Inaprubahan ng owner noong 2026-11-07. Huling bloke ito,
// kaya ito ang namamayani sa anumang naunang halaga ng parehong susi.
Object.assign(en,{"wizardPromotion":"Special Offer (Optional)","wizardNoCta":"No CTA","wizardShop":"Shop Now","wizardOrder":"Order Now","wizardContact":"Message Us","wizardBook":"Book Now","wizardLearn":"Learn More","wizardCustom":"Custom CTA","wizardCustomCta":"Your CTA text","fmtSquare":"Square 1:1","fmtPortrait":"Portrait 4:5","fmtStory":"Story 9:16","detail":"Additional Details","business":"Business Name","contact":"Contact Information","badge":"Highlight Badge","theme":"Theme Colors","enhance":"Enhance Photo","enhanceHint":"Raises brightness 4% and contrast 3%. Reversible. It does not sharpen, restore or redraw anything.","wizardAdvanced":"Advanced Customization (Optional)"});
Object.assign(fil,{"wizardPromotion":"Special Offer (Optional)","wizardNoCta":"Walang CTA","wizardShop":"Shop Now","wizardOrder":"Order Now","wizardContact":"Message Us","wizardBook":"Book Now","wizardLearn":"Learn More","wizardCustom":"Custom CTA","wizardCustomCta":"Sariling CTA text","fmtSquare":"Square 1:1","fmtPortrait":"Portrait 4:5","fmtStory":"Story 9:16","detail":"Additional Details","business":"Business Name","contact":"Contact Information","badge":"Highlight Badge","theme":"Theme Colors","enhance":"Enhance Photo","enhanceHint":"Nagdadagdag ng 4% na liwanag at 3% na contrast. Puwedeng ibalik. Hindi nito pinapatalas o inaayos ang malabong detalye.","wizardAdvanced":"Advanced Customization (Optional)"});
Object.assign(tl,{"wizardPromotion":"Special Offer (Opsyonal)","wizardNoCta":"Walang CTA","wizardShop":"Shop Now","wizardOrder":"Order Now","wizardContact":"Message Us","wizardBook":"Book Now","wizardLearn":"Learn More","wizardCustom":"Custom CTA","wizardCustomCta":"Sariling CTA text","fmtSquare":"Square 1:1","fmtPortrait":"Portrait 4:5","fmtStory":"Story 9:16","detail":"Additional Details","business":"Business Name","contact":"Contact Information","badge":"Highlight Badge","theme":"Theme Colors","enhance":"Enhance Photo","enhanceHint":"Nagdaragdag ng 4% na liwanag at 3% na contrast. Maaaring ibalik. Hindi nito pinapatalas o inaayos ang malabong detalye.","wizardAdvanced":"Advanced Customization (Opsyonal)"});

// Paanyaya sa dropdown ng kategorya at ang limang inaprubahang field-level help.
// Inaprubahan ng owner noong 2026-11-07.
Object.assign(en,{"chooseCategory":"Choose a category","helpAriaHeadline":"About the headline","helpHeadline":"The headline is the main message people notice first on the banner. Keep it short, clear and true, and name one real benefit. Example: \"Freshly Made, Everyday.\"","helpAriaStyle":"About design styles","helpStyle":"Category Palette uses the colours tied to your business category. Theme Colors uses whichever of the four theme colours you pick in Step 4. The other four styles each use their own fixed palette and ignore both.","helpAriaCta":"About the call to action","helpCta":"A call to action tells the customer what to do next, such as order, message or book. Pick the one that matches how you actually take orders. No CTA is a valid choice if you would rather leave the banner without a button.","helpAriaRatio":"About banner sizes","helpRatio":"Square 1:1 is the square post shape. Portrait 4:5 is the taller feed-post shape. Story 9:16 is the tall story or reel shape. Pick the one that fits where you plan to post it.","helpAriaTheme":"About theme colors","helpTheme":"These four palettes repaint the banner only when Design Style in Step 3 is set to Theme Colors. Under the other five styles they make no difference to the banner."});
Object.assign(fil,{"chooseCategory":"Pumili ng category","helpAriaHeadline":"Tungkol sa headline","helpHeadline":"Ang headline ang pangunahing mensahe na unang mapapansin sa banner. Gawing maikli, malinaw at totoo, at banggitin ang isang tunay na benepisyo. Halimbawa: \"Freshly Made, Everyday.\"","helpAriaStyle":"Tungkol sa design style","helpStyle":"Ang Category Palette ay gumagamit ng kulay na nakatali sa business category mo. Ang Theme Colors ay sumusunod sa apat na theme color sa Step 4. Ang apat na iba ay may sariling nakatakdang kulay at hindi sumusunod sa dalawang iyon.","helpAriaCta":"Tungkol sa call to action","helpCta":"Sinasabi ng call to action kung ano ang susunod na gagawin ng customer, gaya ng mag-order, mag-message o mag-book. Piliin ang bagay sa totoong paraan mo ng pagtanggap ng order. Puwede rin ang Walang CTA kung ayaw mong maglagay ng button.","helpAriaRatio":"Tungkol sa sukat ng banner","helpRatio":"Ang Square 1:1 ay parisukat na post. Ang Portrait 4:5 ay mas matangkad na feed post. Ang Story 9:16 ay matangkad na story o reel. Piliin ang bagay sa kung saan mo balak ipost.","helpAriaTheme":"Tungkol sa theme colors","helpTheme":"Ang apat na palette na ito ay nagpapalit ng kulay ng banner kapag Theme Colors ang Design Style sa Step 3. Sa limang ibang style, wala itong epekto sa banner."});
Object.assign(tl,{"chooseCategory":"Pumili ng kategorya","helpAriaHeadline":"Tungkol sa headline","helpHeadline":"Ang headline ang pangunahing mensaheng unang mapapansin sa banner. Gawing maikli, malinaw at totoo, at banggitin ang isang tunay na pakinabang. Halimbawa: \"Freshly Made, Everyday.\"","helpAriaStyle":"Tungkol sa design style","helpStyle":"Ang Category Palette ay gumagamit ng kulay na nakatali sa kategorya ng negosyo mo. Ang Theme Colors ay sumusunod sa apat na kulay ng tema sa Step 4. Ang apat na iba ay may sariling nakatakdang kulay at hindi sumusunod sa dalawang iyon.","helpAriaCta":"Tungkol sa call to action","helpCta":"Sinasabi ng call to action kung ano ang susunod na gagawin ng customer, gaya ng mag-order, magpadala ng mensahe o magpa-book. Piliin ang bagay sa tunay mong paraan ng pagtanggap ng order. Puwede rin ang Walang CTA kung ayaw mong maglagay ng pindutan.","helpAriaRatio":"Tungkol sa sukat ng banner","helpRatio":"Ang Square 1:1 ay parisukat na post. Ang Portrait 4:5 ay mas matangkad na feed post. Ang Story 9:16 ay matangkad na story o reel. Piliin ang bagay sa kung saan mo balak ilagay.","helpAriaTheme":"Tungkol sa theme colors","helpTheme":"Ang apat na palette na ito ay nagpapalit ng kulay ng banner kapag Theme Colors ang Design Style sa Step 3. Sa limang ibang estilo, wala itong epekto sa banner."});
en.tutorialCount=n=>`Tip ${n} of 5`;fil.tutorialCount=n=>`Tip ${n} sa 5`;tl.tutorialCount=n=>`Gabay ${n} sa 5`;
export const STRINGS=Object.freeze({en:Object.freeze(en),fil:Object.freeze(fil),tl:Object.freeze(tl)});
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
let fromOtherTab = null; // wikang pinili sa ibang tab; binabasa lang, hindi isinusulat ulit sa storage
let atLoad=appLang(prefGetLang());
try { const saved=localStorage.getItem("mgpref_lang");if(["en","fil","tl"].includes(saved))atLoad=saved; } catch {} // wika sa pagbukas ng page (pinili ng user, o Filipino/Taglish kapag wala pa)
export const getLang = () => {
  const l = fromOtherTab ?? atLoad;
  return has(STRINGS, l) ? l : "fil";
};

// Kapag pinalitan ang wika sa ibang tab (hal. sa Settings ng Dashboard), sundan ito nang walang reload.
// Ang frozen login-i18n.js pa rin ang may-ari ng "mgpref_lang"; dito binabasa lang ang storage event (walang isinusulat).
export function watchLang(onChange) {
  window.addEventListener("storage", (e) => {
    if (e.key !== "mgpref_lang" || !has(STRINGS, e.newValue) || e.newValue === getLang()) return;
    fromOtherTab = e.newValue;
    onChange(getLang());
  });
}
function lookup(key) {
  const cur = STRINGS[getLang()];
  if (has(cur, key)) return cur[key];
  if (has(STRINGS.en, key)) return STRINGS.en[key];
  return undefined;
}

// t("limit", 60). Walang salin kahit sa English: "" (hindi ang pangalan ng key).
export function t(key, ...args) {
  const v = lookup(key);
  if (v === undefined) return "";
  return typeof v === "function" ? v(...args) : v;
}

// Isinasalin ang mga elementong may data-i18n (text), data-i18n-ph (placeholder) at data-i18n-aria (aria-label)
export function applyStatic(root = document) {
  if (root && root.nodeType === 9) {
    root.documentElement.lang = getLang();
    root.title = t("pageTitle");
  }
  const swap = (attr, read, write) => {
    for (const n of root.querySelectorAll(`[${attr}]`)) {
      const store = attr + "-default";
      if (!n.hasAttribute(store)) n.setAttribute(store, read(n) ?? "");
      const v = lookup(n.getAttribute(attr));
      write(n, typeof v === "string" ? v : n.getAttribute(store));
    }
  };
  swap("data-i18n", (n) => n.textContent, (n, v) => { n.textContent = v; });
  swap("data-i18n-ph", (n) => n.getAttribute("placeholder"), (n, v) => { n.setAttribute("placeholder", v); });
  swap("data-i18n-aria", (n) => n.getAttribute("aria-label"), (n, v) => { n.setAttribute("aria-label", v); });
}
