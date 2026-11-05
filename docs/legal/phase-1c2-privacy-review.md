# MagnetraPH Privacy Policy — REVIEW DRAFT ONLY

Prepared 5 November 2026 (Asia/Manila). Not approved, not effective, and not routed from public pages. This describes the local Phase 1C.2 candidate; deployment is separately gated. All three language versions require the same owner/legal review. Neither version takes precedence until the owner decides.

## English

### Who operates the service
MagnetraPH is the product name. **Owner confirmation required:** legal operator name, business address/country, responsible privacy contact and applicable jurisdiction. `support@magnetra.app` is configured in the application, but mailbox operation, monitoring and response times have not been verified.

### Information handled by the current application
Firebase Authentication handles email/password or Google sign-in, account identifiers, email-verification status and profile metadata. The candidate lets a signed-in user update their display name through Firebase Auth. It does not change their Google account name or email. Password-change and deletion flows request reauthentication.

The Dashboard may request a matching Google provider profile photo from the specifically supported Google image host. The request uses anonymous image loading and no referrer. The image provider still receives the request and ordinary network information; this is not a claim of anonymity. Unaccepted or failed photo URLs use the avatar placeholder. No custom-photo upload or storage service is implemented.

The local Banner editor processes entered text and optional product photos in the browser to render PNGs. It does not upload those assets or call a paid AI generation provider. Downloaded files are controlled by the user and their device. Editable projects are not persistently saved or account-synced.

Protected application requests include Firebase sign-in and App Check tokens and go to the configured Cloudflare Worker. The frontend calls profile setup and account-deletion endpoints. Supabase is the intended database architecture. **Owner confirmation required:** actual deployed server fields, storage locations, logging, recipients and access controls. Repository comments alone do not verify production handling.

### Browser preferences and support
Language and appearance preferences use browser storage when available. Previous System appearance is resolved once to Light or Dark. Existing legacy tools can retain device-level business details and session counters; these are not private projects or subscription usage. Successful sign-out clears the application's `mag_*` local entries and session storage; non-sensitive `mgpref_*` preferences remain. A failed sign-out must not be treated as confirmation that the session ended.

Help & Feedback can prepare an email or copied report. The user reviews and sends it. Optional device information is included only when chosen. Do not send passwords, tokens, reset/verification links or customer information. The app cannot confirm email delivery.

### Security, retention and deletion
Firebase Auth, App Check/reCAPTCHA and the backend are parts of the security architecture. No absolute security guarantee is made. Providers may process technical request data to deliver their services; exact arrangements need confirmation.

The app's account-deletion flow requests backend profile deletion, then Firebase user deletion. It can fail or partially complete. This does not establish deletion of provider logs, backups, support emails or downloaded/shared files. **Owner confirmation required:** retention schedules, backup expiry, deletion verification, legal obligations, access/correction/deletion request procedure and relevant data transfers. No time limit or guaranteed outcome is proposed without evidence.

## Taglish

### Sino ang nagpapatakbo
Product name ang MagnetraPH. **Kailangan ng owner confirmation:** legal operator name, business address/bansa, privacy contact at applicable jurisdiction. Naka-configure ang `support@magnetra.app`, pero hindi pa verified ang mailbox operation, monitoring at response time.

### Data sa kasalukuyang app
Firebase Authentication ang humahawak ng email/password o Google sign-in, account identifiers, email status at profile metadata. Sa candidate na ito, puwedeng i-update ng signed-in user ang Firebase display name. Hindi nito binabago ang pangalan o email sa Google. May reauthentication sa password change at account deletion.

Maaaring mag-load ang Dashboard ng matching Google provider photo mula sa eksaktong supported Google image host. Anonymous image request at no-referrer ang gamit, pero matatanggap pa rin ng image provider ang request at normal network information. Hindi ito pangakong anonymous ang user. Placeholder ang makikita kapag hindi pasado o hindi ma-load ang URL. Wala pang custom-photo upload o storage.

Sa browser pinoproseso ng Banner editor ang text at optional product photo para gumawa ng PNG. Hindi ina-upload ang assets at walang paid AI generation call. Hawak ng user at device ang downloaded files. Hindi pa persistently saved o account-synced ang editable projects.

May Firebase sign-in at App Check tokens ang protected app requests papunta sa configured Cloudflare Worker. May profile setup at deletion endpoints sa frontend. Supabase ang intended database architecture. **Kailangang kumpirmahin ng owner** ang actual deployed fields, storage locations, logs, recipients at access controls. Hindi sapat ang repository comments para i-verify ang production handling.

### Browser preferences at support
Sa browser storage naka-save ang language at appearance kapag available. Isang beses lang kino-convert ang dating System sa Light o Dark. Maaaring may device-level business details at session counters ang legacy tools; hindi ito private projects o subscription usage. Sa successful sign-out, nililinis ang application `mag_*` entries at session storage; naiiwan ang non-sensitive `mgpref_*` preferences. Hindi confirmed na natapos ang session kapag pumalya ang sign-out.

Maaaring ihanda ng Help & Feedback ang email o copied report. Ikaw ang magre-review at magse-send. Optional ang device information. Huwag isama ang password, token, reset/verification link o customer information. Hindi makukumpirma ng app ang email delivery.

### Security, retention at deletion
Bahagi ng security architecture ang Firebase Auth, App Check/reCAPTCHA at backend. Walang absolute security guarantee. Maaaring magproseso ang providers ng technical request data para maihatid ang serbisyo; kailangan pang kumpirmahin ang eksaktong arrangements.

Hihilingin muna ang backend profile deletion bago ang Firebase user deletion. Maaaring pumalya o bahagyang matapos ang flow. Hindi nito pinatutunayang nabura ang provider logs, backups, support emails o downloaded/shared files. **Kailangan ng owner confirmation** sa retention schedules, backup expiry, deletion verification, legal requirements, paraan ng data requests at relevant data transfers. Walang retention deadline o guaranteed deletion outcome na ipinapangako nang walang ebidensya.

## Tagalog

### Sino ang may hawak ng serbisyo
Pangalan ng produkto ang MagnetraPH. **Kailangang kumpirmahin ng owner** ang legal na pangalan ng operator, address at bansa ng negosyo, privacy contact at mga batas na naaangkop. Nakatakda ang `support@magnetra.app` sa app, ngunit hindi pa nakumpirma ang pagpapatakbo at pagbabantay sa inbox o oras ng pagsagot.

### Impormasyong ginagamit ng app
Firebase Authentication ang humahawak ng email/password o Google sign-in, pagkakakilanlan ng account, katayuan ng email at impormasyon ng Profile. Sa candidate na ito, maaaring palitan ng naka-sign in na user ang display name sa Firebase. Hindi nito pinapalitan ang pangalan o email sa Google. Kailangang kumpirmahin muli ang pagkakakilanlan bago magpalit ng password o magbura ng account.

Maaaring kunin ng Dashboard ang katugmang larawan mula sa suportadong Google image host. Walang kasamang browser credentials o referrer ang request. Matatanggap pa rin ng provider ang request at karaniwang impormasyon sa network; hindi nito ginagarantiya ang pagiging anonymous. Karaniwang avatar ang gagamitin kung hindi tanggap o hindi makuha ang larawan. Wala pang pag-upload o imbakan ng sariling Profile photo.

Sa browser binubuo ng Banner editor ang PNG gamit ang mga salita at opsyonal na larawan ng produkto. Hindi nito ina-upload ang mga iyon o gumagamit ng bayad na AI generation. Nasa user at device ang mga na-download na file. Hindi pa permanenteng naitatago o naisasabay sa account ang mga editable project.

May kasamang Firebase sign-in at App Check tokens ang mga protektadong request papunta sa nakatakdang Cloudflare Worker. May mga kahilingan para sa paggawa at pagbura ng profile. Supabase ang nilalayong database. **Kailangan pang kumpirmahin** ang aktuwal na mga field sa server, lugar ng imbakan, logs, tumatanggap ng data at mga tuntunin sa pag-access. Hindi patunay ng aktuwal na production handling ang mga komento sa repository.

### Mga kagustuhan at paghingi ng tulong
Nasa browser storage ang wika at itsura kapag maaari itong gamitin. Ang dating System ay isang beses na pinipiliang Light o Dark. Maaaring may detalye ng negosyo at bilang ng gawain sa lumang tools; hindi ito mga pribadong project o paggamit ng subscription. Matapos makumpirma ang pag-sign out, nililinis ang application `mag_*` entries at session storage. Nananatili ang hindi sensitibong `mgpref_*` preferences. Kung hindi natuloy ang sign-out, hindi dapat ipalagay na natapos ang session.

Maaaring ihanda ang email o kopya ng ulat sa Help & Feedback. Ikaw ang susuri at magpapadala. Isasama lamang ang impormasyon ng device kung pipiliin mo. Huwag magbigay ng password, token, mga link sa pag-reset o pagkumpirma, o impormasyon ng customer. Hindi nakukumpirma ng app ang paghahatid ng email.

### Seguridad, pagtatago at pagbura
Bahagi ng seguridad ang Firebase Auth, App Check/reCAPTCHA at backend. Walang pangakong ganap na ligtas ang lahat ng paggamit. Maaaring magproseso ang providers ng teknikal na impormasyon upang maihatid ang kanilang serbisyo; kailangan pang linawin ang eksaktong kasunduan.

Inuuna ng app ang kahilingan sa pagbura ng backend profile bago burahin ang Firebase user. Maaaring pumalya o bahagya lamang itong matapos. Hindi nito pinatutunayang nabura ang provider logs, backups, mga email o mga na-download at naibahaging file. **Kailangan pang pagtibayin ng owner** ang panahon ng pagtatago, pag-expire ng backup, pagpapatunay ng pagbura, mga legal na obligasyon, paraan ng mga kahilingan sa data at paglipat ng data. Walang itinakdang panahon o garantisadong resulta nang walang sapat na batayan.
