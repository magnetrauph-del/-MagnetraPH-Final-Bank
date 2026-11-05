// Public Help only. No Auth, network, account data or private persistence.
// Tool-specific Help sheets retain their existing help-content.js contract.
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const HELP_LANGUAGES = freeze(['en', 'fil', 'tl']);
export const HELP_TOPICS = freeze([
  { id: 'getting-started', en: 'Getting Started', fil: 'Getting Started', tl: 'Paano magsimula' },
  { id: 'banner', en: 'Banner Studio', fil: 'Banner Studio', tl: 'Banner Studio' },
  { id: 'video', en: 'Video Ads Studio', fil: 'Video Ads Studio', tl: 'Video Ads Studio' },
  { id: 'account-security', en: 'Account & Security', fil: 'Account & Security', tl: 'Account at Seguridad' },
  { id: 'faq', en: 'Frequently Asked Questions', fil: 'Mga madalas itanong', tl: 'Mga madalas itanong' },
  { id: 'troubleshooting', en: 'Troubleshooting', fil: 'Kapag may problema', tl: 'Kapag may problema' },
  { id: 'feedback', en: 'Help & Feedback', fil: 'Help & Feedback', tl: 'Help & Feedback' },
]);
// All 25 public answers are reviewed together in English, Taglish and Tagalog.
export const HELP_ARTICLES = freeze([
  {
    "id": "what-can-i-create",
    "topic": "getting-started",
    "keywords": "start intro simula create advertising",
    "en": {
      "question": "What can I create with MagnetraPH?",
      "body": [
        "Use Create Banner to make an advertisement with your own text and an optional photo. Choose a layout, colors and size, then download a PNG.",
        "AI features for Pro Max Banner Studio and video production in Pro Video Ads Commercial Studio are not available yet."
      ]
    },
    "fil": {
      "question": "Ano ang puwede kong gawin sa MagnetraPH?",
      "body": [
        "Gamitin ang Create Banner para gumawa ng ad gamit ang sarili mong text at optional na photo. Piliin ang layout, kulay at size, saka i-download ang PNG.",
        "Hindi pa available ang AI features ng Pro Max Banner Studio at paggawa ng video sa Pro Video Ads Commercial Studio."
      ]
    },
    "tl": {
      "question": "Ano ang magagawa ko sa MagnetraPH?",
      "body": [
        "Gamitin ang Create Banner para gumawa ng ad gamit ang sarili mong mga salita at larawan kung kailangan. Pumili ng layout, kulay at laki, saka i-download ang PNG.",
        "Hindi pa magagamit ang AI features ng Pro Max Banner Studio at paggawa ng video sa Pro Video Ads Commercial Studio."
      ]
    }
  },
  {
    "id": "create-first-banner",
    "topic": "getting-started",
    "keywords": "first banner begin simula steps",
    "en": {
      "question": "How do I create my first Banner?",
      "body": [
        {
          "ol": [
            "On Home, select Create Banner.",
            "Choose a size, layout and color theme.",
            "Enter a headline. Add details, a price and a photo if needed.",
            "Check the preview, then select Save as PNG."
          ]
        },
        "You choose the content. The editor does not generate AI images or post your Banner for you."
      ]
    },
    "fil": {
      "question": "Paano ko gagawin ang una kong Banner?",
      "body": [
        {
          "ol": [
            "Sa Home, piliin ang Create Banner.",
            "Piliin ang size, layout at color theme.",
            "Maglagay ng headline. Idagdag ang detalye, presyo at photo kung kailangan.",
            "I-check ang preview, saka piliin ang Save as PNG."
          ]
        },
        "Ikaw ang pipili ng content. Hindi gumagawa ng AI image o kusang nagpo-post ang editor."
      ]
    },
    "tl": {
      "question": "Paano ako gagawa ng unang Banner?",
      "body": [
        {
          "ol": [
            "Sa Home, piliin ang Create Banner.",
            "Piliin ang laki, layout at kulay.",
            "Maglagay ng headline. Idagdag ang detalye, presyo at larawan kung kailangan.",
            "Suriin ang preview, saka piliin ang Save as PNG."
          ]
        },
        "Ikaw ang pipili ng nilalaman. Hindi gumagawa ng AI image o kusang nagpo-post ang editor."
      ]
    }
  },
  {
    "id": "phone-and-computer",
    "topic": "getting-started",
    "keywords": "android mobile phone computer chrome browser",
    "en": {
      "question": "Can I use my phone or computer?",
      "body": [
        "Yes. Use an updated browser, such as Chrome on Android or your computer. If sign-in or downloads fail inside Facebook or Messenger, open MagnetraPH in your regular browser.",
        "Your language and appearance choices can be remembered in that browser. Unfinished Banners are not saved across devices."
      ]
    },
    "fil": {
      "question": "Puwede ba sa phone o computer?",
      "body": [
        "Oo. Gumamit ng updated na browser, gaya ng Chrome sa Android o computer. Kung ayaw ng sign-in o download sa loob ng Facebook o Messenger, buksan ang MagnetraPH sa regular mong browser.",
        "Maaaring matandaan ng browser ang wika at appearance na pinili mo. Hindi naka-save sa ibang device ang hindi pa tapos na Banner."
      ]
    },
    "tl": {
      "question": "Magagamit ba ito sa phone o computer?",
      "body": [
        "Oo. Gumamit ng bagong bersyon ng browser, tulad ng Chrome sa Android o computer. Kung hindi gumana ang sign-in o download sa loob ng Facebook o Messenger, buksan ang MagnetraPH sa karaniwang browser mo.",
        "Maaaring matandaan ng browser ang pinili mong wika at itsura. Hindi naka-save sa ibang device ang hindi pa tapos na Banner."
      ]
    }
  },
  {
    "id": "banner-text-and-price",
    "topic": "banner",
    "keywords": "headline text price promo layout theme edit presyo",
    "en": {
      "question": "How do I edit the text, price and design?",
      "body": [
        "Open Create Banner and change the headline, details, business name, contact or price. Use the size, layout and color choices to adjust the design.",
        "Check the preview after each change. Keep the text short and make sure the price, spelling and contact details are correct before downloading."
      ]
    },
    "fil": {
      "question": "Paano ko babaguhin ang text, presyo at design?",
      "body": [
        "Buksan ang Create Banner at baguhin ang headline, detalye, business name, contact o presyo. Piliin ang size, layout at kulay na bagay sa ad mo.",
        "I-check ang preview pagkatapos ng bawat edit. Panatilihing maikli ang text at tiyaking tama ang presyo, spelling at contact bago mag-download."
      ]
    },
    "tl": {
      "question": "Paano ko babaguhin ang mga salita, presyo at disenyo?",
      "body": [
        "Buksan ang Create Banner at baguhin ang headline, detalye, pangalan ng negosyo, contact o presyo. Piliin ang laki, layout at kulay na bagay sa ad mo.",
        "Suriin ang preview pagkatapos ng bawat pagbabago. Panatilihing maikli ang teksto at tiyaking tama ang presyo, baybay at contact bago mag-download."
      ]
    }
  },
  {
    "id": "banner-photo",
    "topic": "banner",
    "keywords": "photo logo image jpg png webp size upload larawan",
    "en": {
      "question": "How do I add a product photo?",
      "body": [
        "In the Banner editor, choose a JPG, PNG or WebP image up to 15 MB. A photo is optional, so you can also make a Banner for a service without one.",
        "Use photos and logos you own or have permission to use. Check how the photo fits in the preview. Your image is used in the browser; it is not uploaded as a saved project."
      ]
    },
    "fil": {
      "question": "Paano ako magdadagdag ng product photo?",
      "body": [
        "Sa Banner editor, pumili ng JPG, PNG o WebP image na hanggang 15 MB. Optional ang photo, kaya puwede kang gumawa ng Banner para sa service kahit wala nito.",
        "Gumamit ng photo at logo na sa iyo o may pahintulot kang gamitin. I-check kung maayos ang puwesto ng photo sa preview. Sa browser lang ginagamit ang image; hindi ito ina-upload bilang saved project."
      ]
    },
    "tl": {
      "question": "Paano ako magdadagdag ng larawan ng produkto?",
      "body": [
        "Sa Banner editor, pumili ng JPG, PNG o WebP na larawan na hanggang 15 MB. Hindi kailangan ang larawan, kaya maaari kang gumawa ng Banner para sa serbisyo kahit wala nito.",
        "Gumamit ng mga larawan at logo na sa iyo o may pahintulot kang gamitin. Suriin kung maayos ang puwesto ng larawan sa preview. Sa browser lamang ito ginagamit at hindi ina-upload bilang naka-save na project."
      ]
    }
  },
  {
    "id": "banner-sizes",
    "topic": "banner",
    "keywords": "format dimensions square portrait story export size laki",
    "en": {
      "question": "Which Banner sizes are available?",
      "body": [
        {
          "ul": [
            "Square: 1080 × 1080 px.",
            "Portrait: 1080 × 1350 px.",
            "Story: 1080 × 1920 px."
          ]
        },
        "Choose the size before downloading. If you change it, check the text and photo in the preview again."
      ]
    },
    "fil": {
      "question": "Anong Banner sizes ang available?",
      "body": [
        {
          "ul": [
            "Square: 1080 × 1080 px.",
            "Portrait: 1080 × 1350 px.",
            "Story: 1080 × 1920 px."
          ]
        },
        "Piliin ang size bago mag-download. Kapag nagpalit ka, i-check ulit ang text at photo sa preview."
      ]
    },
    "tl": {
      "question": "Anong mga laki ng Banner ang magagamit?",
      "body": [
        {
          "ul": [
            "Square: 1080 × 1080 px.",
            "Portrait: 1080 × 1350 px.",
            "Story: 1080 × 1920 px."
          ]
        },
        "Piliin ang laki bago mag-download. Kapag pinalitan mo ito, suriin muli ang mga salita at larawan sa preview."
      ]
    }
  },
  {
    "id": "banner-download",
    "topic": "banner",
    "keywords": "png save download export file",
    "en": {
      "question": "How do I download my Banner?",
      "body": [
        "Check your Banner, then select Save as PNG. Look for the image in your browser’s Downloads or your device’s Files app.",
        "If a save preview appears, follow the instructions shown. A PNG keeps the finished image, not a project you can reopen and edit. Download a new PNG whenever you change your Banner."
      ]
    },
    "fil": {
      "question": "Paano ko ida-download ang Banner ko?",
      "body": [
        "I-check ang Banner, saka piliin ang Save as PNG. Hanapin ang image sa Downloads ng browser o sa Files app ng device mo.",
        "Kung may save preview, sundin ang instructions doon. Finished image ang PNG, hindi project na puwedeng buksan at i-edit ulit. Mag-download ng bagong PNG kapag may binago ka sa Banner."
      ]
    },
    "tl": {
      "question": "Paano ko ida-download ang Banner?",
      "body": [
        "Suriin ang Banner, saka piliin ang Save as PNG. Hanapin ang larawan sa Downloads ng browser o sa Files app ng device mo.",
        "Kung may preview para sa pag-save, sundin ang mga tagubilin doon. Larawan ang PNG at hindi project na puwedeng buksan at baguhin ulit. Mag-download ng bagong PNG kapag may binago ka sa Banner."
      ]
    }
  },
  {
    "id": "banner-unsaved-work",
    "topic": "banner",
    "keywords": "draft back keep editing leave saved lost reload restore",
    "en": {
      "question": "Will my unfinished Banner be saved?",
      "body": [
        "Not yet. Finish your Banner and download the PNG before leaving the editor. The PNG keeps your finished image, not a project you can reopen and edit.",
        "Keep the editor open if you want to continue working. If you see a message before leaving, choose Keep editing to stay. You may lose unfinished work if you reload the page or close the browser."
      ]
    },
    "fil": {
      "question": "Mase-save ba ang hindi ko pa tapos na Banner?",
      "body": [
        "Hindi pa. Tapusin muna ang Banner at i-download ang PNG bago umalis sa editor. Finished image ang PNG, hindi project na puwedeng buksan at i-edit ulit.",
        "Panatilihing bukas ang editor kung magpapatuloy ka pa. Kapag may mensahe bago umalis, piliin ang Keep editing para manatili. Maaaring mawala ang hindi pa tapos kapag ni-reload o isinara ang browser."
      ]
    },
    "tl": {
      "question": "Mase-save ba ang Banner na hindi pa tapos?",
      "body": [
        "Hindi pa. Tapusin ang Banner at i-download ang PNG bago umalis sa editor. Larawan ang PNG at hindi kopya ng project na mabubuksan at mababago ulit.",
        "Panatilihing bukas ang editor kung magpapatuloy ka pa. Kapag may mensahe bago umalis, piliin ang Keep editing para manatili. Maaaring mawala ang hindi pa tapos kapag ni-reload o isinara ang browser."
      ]
    }
  },
  {
    "id": "video-availability",
    "topic": "video",
    "keywords": "video commercial presenter production planned coming soon",
    "en": {
      "question": "Can I create a video commercial now?",
      "body": [
        "Pro Video Ads Commercial Studio is not available yet. The Video Ads Studio image on Home is a concept, not a playable video.",
        "For now, use Create Banner to make and download a PNG advertisement."
      ]
    },
    "fil": {
      "question": "Puwede na ba akong gumawa ng video commercial?",
      "body": [
        "Hindi pa available ang Pro Video Ads Commercial Studio. Concept image ang nasa Video Ads Studio sa Home, hindi playable video.",
        "Sa ngayon, gamitin ang Create Banner para gumawa at mag-download ng PNG ad."
      ]
    },
    "tl": {
      "question": "Maaari na ba akong gumawa ng video commercial?",
      "body": [
        "Hindi pa magagamit ang Pro Video Ads Commercial Studio. Larawang konsepto lamang ang nasa Video Ads Studio sa Home at hindi video na mapapanood.",
        "Sa ngayon, gamitin ang Create Banner para gumawa at mag-download ng PNG ad."
      ]
    }
  },
  {
    "id": "profile-name",
    "topic": "account-security",
    "keywords": "profile display name account edit pangalan",
    "en": {
      "question": "How do I change my display name?",
      "body": [
        "Open Your Account, choose My Profile, edit Display name and select Save name. Use 1–60 characters: letters, numbers, spaces and simple punctuation.",
        "Wait for the saved message. If it does not save, check your connection and try again. Changing your name does not change your email or how you sign in."
      ]
    },
    "fil": {
      "question": "Paano ko papalitan ang display name ko?",
      "body": [
        "Buksan ang Your Account, piliin ang My Profile, i-edit ang Display name at pindutin ang Save name. Gumamit ng 1–60 character: letra, numero, space at simpleng bantas.",
        "Hintayin ang mensaheng saved na. Kung hindi na-save, i-check ang connection at subukan ulit. Hindi mababago ang email o paraan ng sign-in kapag pinalitan mo ang pangalan."
      ]
    },
    "tl": {
      "question": "Paano ko babaguhin ang display name ko?",
      "body": [
        "Buksan ang Your Account at My Profile, baguhin ang Display name, saka piliin ang Save name. Gumamit ng 1–60 character: letra, numero, puwang at simpleng bantas.",
        "Hintayin ang mensaheng naka-save na. Kung hindi natuloy, suriin ang koneksyon at subukang muli. Hindi mababago ang email o paraan ng pag-sign in kapag pinalitan mo ang pangalan."
      ]
    }
  },
  {
    "id": "profile-photo",
    "topic": "account-security",
    "keywords": "profile photo avatar picture google upload",
    "en": {
      "question": "Can I change my Profile picture?",
      "body": [
        "Uploading, changing or removing your own Profile picture is not available yet.",
        "Some Google sign-in photos can appear automatically. If your photo isn’t available, you’ll see the default avatar instead."
      ]
    },
    "fil": {
      "question": "Puwede ko bang palitan ang Profile picture ko?",
      "body": [
        "Hindi pa available ang pag-upload, pagpapalit o pag-alis ng sarili mong Profile picture.",
        "Maaaring kusang lumabas ang ilang Google sign-in photo. Kung hindi available ang photo, default avatar ang makikita mo."
      ]
    },
    "tl": {
      "question": "Maaari ko bang palitan ang larawan sa Profile?",
      "body": [
        "Hindi pa maaaring mag-upload, magpalit o mag-alis ng sarili mong larawan sa Profile.",
        "Maaaring kusang lumabas ang ilang larawan mula sa Google sign-in. Kung hindi maipakita ang larawan, karaniwang avatar ang makikita mo."
      ]
    }
  },
  {
    "id": "preferences",
    "topic": "account-security",
    "keywords": "language taglish tagalog english light dark appearance preferences",
    "en": {
      "question": "How do I change the language or appearance?",
      "body": [
        "Open Your Account → Preferences. Choose English, Taglish or Tagalog, and Light Mode or Dark Mode. New users start in Light Mode.",
        "Your browser can remember these choices when it allows saved preferences. Account and Help support all three languages. Some tool screens still use English or Taglish."
      ]
    },
    "fil": {
      "question": "Paano ko papalitan ang wika o appearance?",
      "body": [
        "Buksan ang Your Account → Preferences. Pumili ng English, Taglish o Tagalog, at Light Mode o Dark Mode. Light Mode ang unang gamit ng bagong user.",
        "Maaaring matandaan ng browser ang mga pinili mo kung pinapayagan nitong mag-save ng preferences. May tatlong wika ang Account at Help. English o Taglish pa rin ang ilang tool screen."
      ]
    },
    "tl": {
      "question": "Paano ko babaguhin ang wika o itsura?",
      "body": [
        "Buksan ang Your Account → Preferences. Pumili ng English, Taglish o Tagalog, at Light Mode o Dark Mode. Light Mode ang unang gamit ng bagong user.",
        "Maaaring matandaan ng browser ang mga pinili mo kung pinapayagan nitong mag-save ng mga kagustuhan. May tatlong wika ang Account at Help. English o Taglish pa rin ang ilang bahagi ng tools."
      ]
    }
  },
  {
    "id": "password",
    "topic": "account-security",
    "keywords": "password forgot reset security change nakalimutan",
    "en": {
      "question": "How do I change or reset my password?",
      "body": [
        "If you use email and password, open Your Account → Security to change your password. You’ll need your current password.",
        "Forgot it? Use Forgot password? on the login page, then check your inbox and spam folder. If you sign in with Google, manage your password through Google. Keep passwords and reset links private."
      ]
    },
    "fil": {
      "question": "Paano ko papalitan o ire-reset ang password ko?",
      "body": [
        "Kung email at password ang gamit mo, buksan ang Your Account → Security para palitan ang password. Kailangan ang kasalukuyang password mo.",
        "Nakalimutan mo? Gamitin ang Forgot password? sa login page, saka tingnan ang inbox at spam. Kung Google ang sign-in mo, sa Google palitan ang password. Huwag ibahagi ang password o reset link."
      ]
    },
    "tl": {
      "question": "Paano ko babaguhin o ire-reset ang password?",
      "body": [
        "Kung email at password ang gamit mo, buksan ang Your Account → Security para baguhin ang password. Kailangan ang kasalukuyang password mo.",
        "Kung nakalimutan mo ito, gamitin ang Forgot password? sa login page at tingnan ang inbox at spam. Kung Google ang gamit mo sa pag-sign in, sa Google baguhin ang password. Huwag ibahagi ang password o reset link."
      ]
    }
  },
  {
    "id": "sign-out",
    "topic": "account-security",
    "keywords": "logout sign out failure account shared device",
    "en": {
      "question": "How do I sign out safely?",
      "body": [
        "Open Your Account and select Sign Out. Wait until the login page appears.",
        "If sign-out fails, check your connection and try again. Your account may still be signed in. Closing a tab does not always sign you out, so take extra care on a shared device."
      ]
    },
    "fil": {
      "question": "Paano ako ligtas na mag-Sign Out?",
      "body": [
        "Buksan ang Your Account at piliin ang Sign Out. Hintaying lumabas ang login page.",
        "Kung hindi natuloy, i-check ang connection at subukan ulit. Maaaring naka-sign in ka pa. Hindi sapat ang pagsara ng tab, lalo na kung may ibang gumagamit ng device."
      ]
    },
    "tl": {
      "question": "Paano ako ligtas na mag-Sign Out?",
      "body": [
        "Buksan ang Your Account at piliin ang Sign Out. Hintaying lumabas ang login page.",
        "Kung hindi natuloy, suriin ang koneksyon at subukang muli. Maaaring naka-sign in ka pa. Hindi ibig sabihing naka-sign out ka na kapag isinara ang tab. Mag-ingat kung may ibang gumagamit ng device."
      ]
    }
  },
  {
    "id": "account-deletion",
    "topic": "account-security",
    "keywords": "delete account data remove security privacy",
    "en": {
      "question": "How do I delete my Account?",
      "body": [
        "Open Your Account → Security and read the Delete Account details before continuing. You’ll be asked to confirm your sign-in.",
        "If you see an error, read it before trying again; deletion may be incomplete. Downloaded files and emails you sent are not removed. This action does not guarantee that every record or backup is erased."
      ]
    },
    "fil": {
      "question": "Paano ko ide-delete ang Account ko?",
      "body": [
        "Buksan ang Your Account → Security at basahin ang Delete Account details bago magpatuloy. Hihilingin sa iyong kumpirmahin ulit ang sign-in mo.",
        "Kung may error, basahin muna bago ulitin; maaaring hindi pa kumpleto ang pag-delete. Hindi kasama ang downloaded files at naipadala mong email. Hindi nito ginagarantiyang mabubura ang lahat ng record o backup."
      ]
    },
    "tl": {
      "question": "Paano ko buburahin ang Account?",
      "body": [
        "Buksan ang Your Account → Security at basahin ang detalye ng Delete Account bago magpatuloy. Hihilingin sa iyong kumpirmahin muli ang pag-sign in.",
        "Kung may error, basahin muna bago ulitin; maaaring hindi pa tapos ang pagbura. Hindi kasama ang mga na-download na file at naipadala mong email. Hindi nito ginagarantiyang mabubura ang lahat ng tala o backup."
      ]
    }
  },
  {
    "id": "ask-magnetra",
    "topic": "faq",
    "keywords": "ask ai assistant guidance search replies",
    "en": {
      "question": "Can Ask Magnetra give AI advertising advice?",
      "body": [
        "AI advertising guidance is not available yet. Ask Magnetra explains what is planned, but it cannot answer questions or create ads for you.",
        "For now, use the Help Center for steps on using the current tools."
      ]
    },
    "fil": {
      "question": "Puwede na bang humingi ng AI advertising advice sa Ask Magnetra?",
      "body": [
        "Hindi pa available ang AI advertising guidance. Ipinapakita ng Ask Magnetra ang planong feature, pero hindi pa ito sumasagot sa tanong o gumagawa ng ad para sa iyo.",
        "Sa ngayon, gamitin ang Help Center para sa mga hakbang sa paggamit ng kasalukuyang tools."
      ]
    },
    "tl": {
      "question": "Nagbibigay na ba ng AI advertising advice ang Ask Magnetra?",
      "body": [
        "Hindi pa magagamit ang AI advertising guidance. Ipinapakita ng Ask Magnetra ang planong feature, pero hindi pa ito sumasagot sa tanong o gumagawa ng ad para sa iyo.",
        "Sa ngayon, gamitin ang Help Center para sa mga hakbang sa paggamit ng kasalukuyang tools."
      ]
    }
  },
  {
    "id": "my-projects",
    "topic": "faq",
    "keywords": "private projects saving autosave cloud sync recovery",
    "en": {
      "question": "Where are My Projects saved?",
      "body": [
        "Project saving is not available yet. My Projects does not keep a copy of your work or let you reopen it on another device.",
        "Finish your Banner and download the PNG before leaving the editor. Keep the downloaded image in your own files."
      ]
    },
    "fil": {
      "question": "Saan naka-save ang My Projects?",
      "body": [
        "Hindi pa available ang project saving. Hindi pa nagtatago ng kopya ng gawa mo ang My Projects o nagbubukas nito sa ibang device.",
        "Tapusin ang Banner at i-download ang PNG bago umalis sa editor. Itago ang na-download na image sa sarili mong files."
      ]
    },
    "tl": {
      "question": "Saan naka-save ang My Projects?",
      "body": [
        "Hindi pa magagamit ang pag-save ng project. Wala pang kopya ng gawa mo sa My Projects na mabubuksan sa ibang device.",
        "Tapusin ang Banner at i-download ang PNG bago umalis sa editor. Itago ang na-download na larawan sa sarili mong mga file."
      ]
    }
  },
  {
    "id": "publishing-and-gallery",
    "topic": "faq",
    "keywords": "post automatic social facebook tiktok instagram youtube gallery sales buyers",
    "en": {
      "question": "Does MagnetraPH post ads or find buyers for me?",
      "body": [
        "No. You choose where to share your downloaded Banner. MagnetraPH does not post it for you or find buyers, and it does not guarantee traffic or sales.",
        "Official Gallery is planned for samples selected by the owner. Public posting, comments and reactions are not available."
      ]
    },
    "fil": {
      "question": "Kusang nagpo-post ba ang MagnetraPH o naghahanap ng buyer?",
      "body": [
        "Hindi. Ikaw ang pipili kung saan ibabahagi ang na-download mong Banner. Hindi ito kusang ipo-post ng MagnetraPH o hahanapan ng buyer, at walang garantisadong traffic o sales.",
        "Para sa samples na pinili ng owner ang planong Official Gallery. Walang public posting, comments o reactions."
      ]
    },
    "tl": {
      "question": "Kusang nagpo-post ba ang MagnetraPH o naghahanap ng buyer?",
      "body": [
        "Hindi. Ikaw ang pipili kung saan ibabahagi ang na-download mong Banner. Hindi ito kusang ipo-post ng MagnetraPH o hahanapan ng buyer. Walang garantisadong traffic o benta.",
        "Para sa mga halimbawang pinili ng owner ang planong Official Gallery. Wala pang pampublikong post, komento o reaksyon."
      ]
    }
  },
  {
    "id": "plans-and-usage",
    "topic": "faq",
    "keywords": "subscription payment plan usage credits paid free",
    "en": {
      "question": "Where can I check my Plan & Usage?",
      "body": [
        "Open Your Account and select Plan & Usage. Subscription, credit and billing information are not available yet."
      ]
    },
    "fil": {
      "question": "Saan ko makikita ang Plan & Usage?",
      "body": [
        "Buksan ang Your Account at piliin ang Plan & Usage. Hindi pa available ang impormasyon tungkol sa subscription, credits at billing."
      ]
    },
    "tl": {
      "question": "Saan ko makikita ang Plan & Usage?",
      "body": [
        "Buksan ang Your Account at piliin ang Plan & Usage. Hindi pa magagamit ang impormasyon tungkol sa subscription, credit at pagsingil."
      ]
    }
  },
  {
    "id": "login-error",
    "topic": "troubleshooting",
    "keywords": "login error sign in connection cors app check recaptcha preview",
    "en": {
      "question": "I can’t sign in. What should I check?",
      "body": [
        "Check your internet connection and use the method you chose when you created your account: email and password, or Google. Verify your email if asked.",
        "Try an updated browser such as Chrome. If a security message still blocks sign-in, share the exact message through Help & Feedback. Keep security protections turned on."
      ]
    },
    "fil": {
      "question": "Hindi ako makapag-sign in. Ano ang dapat i-check?",
      "body": [
        "I-check ang internet at gamitin ang paraan na pinili mo noong gumawa ka ng account: email at password, o Google. I-verify ang email kung hinihingi.",
        "Subukan sa updated na browser, gaya ng Chrome. Kung may security message pa rin, ibahagi ang eksaktong mensahe sa Help & Feedback. Panatilihing naka-on ang security protections."
      ]
    },
    "tl": {
      "question": "Hindi ako makapag-sign in. Ano ang susuriin ko?",
      "body": [
        "Suriin ang internet at gamitin ang pinili mong paraan noong ginawa ang account: email at password, o Google. Kumpirmahin ang email kung hinihingi.",
        "Subukan sa bagong bersyon ng browser, tulad ng Chrome. Kung may mensaheng pangseguridad pa rin, ibahagi ang eksaktong mensahe sa Help & Feedback. Panatilihing naka-on ang mga proteksyon."
      ]
    }
  },
  {
    "id": "verification-email",
    "topic": "troubleshooting",
    "keywords": "email verification resend inbox spam",
    "en": {
      "question": "I didn’t receive the verification email. What can I do?",
      "body": [
        "Check your email address, inbox and spam folder. Sign in with your email and password, then select Send verification email again if it appears.",
        "Wait before asking for another email. Use the newest valid link and keep it private."
      ]
    },
    "fil": {
      "question": "Hindi dumating ang verification email. Ano ang puwede kong gawin?",
      "body": [
        "I-check ang email address, inbox at spam. Mag-sign in gamit ang email at password, saka piliin ang Send verification email again kung lumabas ito.",
        "Maghintay bago humingi ulit ng email. Gamitin ang pinakabagong valid na link at huwag itong ibahagi."
      ]
    },
    "tl": {
      "question": "Hindi dumating ang verification email. Ano ang gagawin ko?",
      "body": [
        "Tingnan ang email address, inbox at spam. Mag-sign in gamit ang email at password, saka piliin ang Send verification email again kung lumabas ito.",
        "Maghintay bago humingi ng panibagong email. Gamitin ang pinakabagong valid na link at huwag itong ibahagi."
      ]
    }
  },
  {
    "id": "google-sign-in",
    "topic": "troubleshooting",
    "keywords": "google popup messenger facebook browser blocked",
    "en": {
      "question": "Why won’t Google sign-in open?",
      "body": [
        "Open MagnetraPH in your regular browser, such as Chrome on Android, instead of inside Facebook or Messenger. Select Continue with Google and choose your account.",
        "Check whether the browser blocked the sign-in window. If it still does not work, describe the error through Help & Feedback. Do not include passwords or sign-in links."
      ]
    },
    "fil": {
      "question": "Bakit ayaw bumukas ng Google sign-in?",
      "body": [
        "Buksan ang MagnetraPH sa regular mong browser, gaya ng Chrome sa Android, sa halip na sa loob ng Facebook o Messenger. Piliin ang Continue with Google at ang account mo.",
        "I-check kung hinarang ng browser ang sign-in window. Kung ayaw pa rin, ilarawan ang error sa Help & Feedback. Huwag isama ang password o sign-in link."
      ]
    },
    "tl": {
      "question": "Bakit hindi bumubukas ang Google sign-in?",
      "body": [
        "Buksan ang MagnetraPH sa karaniwang browser mo, tulad ng Chrome sa Android, sa halip na sa loob ng Facebook o Messenger. Piliin ang Continue with Google at ang account mo.",
        "Tingnan kung hinarang ng browser ang sign-in window. Kung hindi pa rin gumana, ilarawan ang error sa Help & Feedback. Huwag isama ang password o link para sa pag-sign in."
      ]
    }
  },
  {
    "id": "download-problem",
    "topic": "troubleshooting",
    "keywords": "png download failed blank photo export price file",
    "en": {
      "question": "My Banner download failed. What should I do?",
      "body": [
        "Keep the editor open. Check the preview and any message beside the photo or Save as PNG button, then try again.",
        "If you are inside Facebook or Messenger, try your regular browser. Follow any save-preview instructions shown. When you change a price or other text, download a new PNG; an older file will not update itself."
      ]
    },
    "fil": {
      "question": "Hindi na-download ang Banner ko. Ano ang gagawin ko?",
      "body": [
        "Panatilihing bukas ang editor. I-check ang preview at anumang mensahe sa photo o Save as PNG button, saka subukan ulit.",
        "Kung nasa Facebook o Messenger ka, subukan sa regular mong browser. Sundin ang instructions kung may save preview. Kapag nagbago ka ng presyo o text, mag-download ng bagong PNG; hindi kusang magbabago ang lumang file."
      ]
    },
    "tl": {
      "question": "Hindi na-download ang Banner. Ano ang gagawin ko?",
      "body": [
        "Panatilihing bukas ang editor. Suriin ang preview at anumang mensahe sa larawan o Save as PNG button, saka subukang muli.",
        "Kung nasa Facebook o Messenger ka, subukan sa karaniwang browser mo. Sundin ang mga tagubilin kung may preview para sa pag-save. Kapag binago ang presyo o mga salita, mag-download ng bagong PNG. Hindi kusang magbabago ang lumang file."
      ]
    }
  },
  {
    "id": "contact-support",
    "topic": "feedback",
    "keywords": "support help feedback email contact report problem",
    "en": {
      "question": "How do I send feedback or report a problem?",
      "body": [
        {
          "ol": [
            "Select Help & Feedback below.",
            "Describe your question or what happened. Include the error message if you saw one.",
            "Review the message, then send it from your email app. If no app opens, use the copy option."
          ]
        },
        "The message is addressed to support@magnetra.app. MagnetraPH cannot confirm delivery or a response time.",
        "Device information is optional. Review it before including it. Keep passwords, security codes, sign-in links and private customer information out of your message."
      ]
    },
    "fil": {
      "question": "Paano ako magpapadala ng feedback o magre-report ng problema?",
      "body": [
        {
          "ol": [
            "Piliin ang Help & Feedback sa ibaba.",
            "Ilarawan ang tanong mo o ang nangyari. Isama ang error message kung meron.",
            "I-review ang mensahe, saka ipadala gamit ang email app mo. Kung walang bumukas na app, gamitin ang copy option."
          ]
        },
        "Para sa support@magnetra.app ang mensahe. Hindi makukumpirma ng MagnetraPH ang delivery o oras ng pagsagot.",
        "Optional ang device information. I-review muna bago isama. Huwag magsama ng password, security code, sign-in link o private na impormasyon ng customer."
      ]
    },
    "tl": {
      "question": "Paano ako magpapadala ng feedback o mag-uulat ng problema?",
      "body": [
        {
          "ol": [
            "Piliin ang Help & Feedback sa ibaba.",
            "Ilarawan ang tanong mo o ang nangyari. Isama ang mensahe ng error kung mayroon.",
            "Suriin ang mensahe, saka ipadala gamit ang email app mo. Kung walang bumukas na app, gamitin ang pagpipilian sa pagkopya."
          ]
        },
        "Para sa support@magnetra.app ang mensahe. Hindi makukumpirma ng MagnetraPH kung nakarating ito o kung kailan masasagot.",
        "Hindi kailangang isama ang impormasyon ng device. Suriin muna bago idagdag. Huwag isama ang password, security code, link para sa pag-sign in o pribadong impormasyon ng customer."
      ]
    }
  },
  {
    "id": "privacy-and-terms",
    "topic": "feedback",
    "keywords": "privacy policy terms legal data documents",
    "en": {
      "question": "Where can I read the Privacy Policy and Terms of Service?",
      "body": [
        "Select Privacy Policy or Terms of Service in the footer to open the currently published document."
      ]
    },
    "fil": {
      "question": "Saan ko mababasa ang Privacy Policy at Terms of Service?",
      "body": [
        "Piliin ang Privacy Policy o Terms of Service sa ibaba para buksan ang kasalukuyang dokumento."
      ]
    },
    "tl": {
      "question": "Saan ko mababasa ang Privacy Policy at Terms of Service?",
      "body": [
        "Piliin ang Privacy Policy o Terms of Service sa ibaba para buksan ang kasalukuyang dokumento."
      ]
    }
  }
]);
export const helpLanguage = lang => HELP_LANGUAGES.includes(lang) ? lang : 'fil';
export const getHelpArticle = id => HELP_ARTICLES.find(item => item.id === id) || null;
export const articleText = (item, lang) => item?.[helpLanguage(lang)] || null;
export const topicTitle = (topic, lang) => topic[helpLanguage(lang)];
const fold = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
// Question words should not hide a relevant answer. Search the selected language
// and English together so familiar product terms also work in Filipino queries.
const SEARCH_FILLERS = new Set(['how', 'do', 'does', 'can', 'i', 'to', 'my', 'the', 'a', 'an', 'is', 'are', 'what', 'where', 'will', 'why', 'paano', 'ko', 'mo', 'ang', 'ng', 'sa', 'ba', 'mga', 'mag', 'bakit', 'ako']);
export function searchHelpArticles(query, lang) {
  const words = fold(String(query ?? '').slice(0, 80)).split(' ').filter(word => word && !SEARCH_FILLERS.has(word));
  if (!words.length) return HELP_ARTICLES.slice();
  return HELP_ARTICLES.filter(item => {
    const topic = HELP_TOPICS.find(topic => topic.id === item.topic);
    const text = [...new Set([helpLanguage(lang), 'en'])].flatMap(language => {
      const value = articleText(item, language);
      return [value.question, topicTitle(topic, language), ...value.body.map(block => typeof block === 'string' ? block : Object.values(block).flat().join(' '))];
    });
    const hay = fold([item.keywords, ...text].join(' '));
    return words.every(word => hay.includes(word));
  });
}
