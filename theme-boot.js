// theme-boot.js - v1.1 - itsura (light o dark) bago lumabas ang page. Walang emoji, walang network.
// Para sa mga page na may class="mg-themeable" sa <html>: Dashboard, Instant Banner, Quotes at Follow-up (Phase 1.1).
// Kapag "light" o "dark" ang pinili ng user sa Settings, inilalagay agad bilang data-theme para hindi kumislap ng puti.
// Kapag "system" o wala pang pinili: walang data-theme, at ang setting ng phone ang susundin (CSS prefers-color-scheme).
// Isang key lang ang binabasa (mgpref_theme) at tatlong value lang ang tinatanggap.
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("mg-themeable")) return;
  var pref = "system";
  try { pref = localStorage.getItem("mgpref_theme") || "system"; } catch (e) { /* walang storage: sundin ang phone */ }
  if (pref === "light" || pref === "dark") {
    root.setAttribute("data-theme", pref);
    // Kulay ng address bar: sumusunod sa piniling itsura (kapag "system", ang media ng meta ang bahala)
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute("content", pref === "dark" ? "#121033" : "#F6F4FE");
  } else root.removeAttribute("data-theme");
})();
