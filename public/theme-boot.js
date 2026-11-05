// theme-boot.js - v1.2 - itsura (light o dark) bago lumabas ang page. Walang emoji, walang network.
// Para sa mga page na may class="mg-themeable" sa <html>: Dashboard, Instant Banner, Quotes at Follow-up (Phase 1.1),
// at Help Center, Privacy Policy at Terms (P0/P1). v1.2: bagong kulay ng address bar sa Night Mode (Soft Indigo).
// Kapag "light" o "dark" ang pinili ng user sa Settings, inilalagay agad bilang data-theme para hindi kumislap ng puti.
// Light is the default. Legacy System resolves once to an explicit light/dark preference.
// Existing preference key: mgpref_theme. System is accepted only for migration.
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("mg-themeable")) return;
  var pref = "light";
  try { pref = localStorage.getItem("mgpref_theme") || "light"; } catch (e) { /* storage unavailable: keep the light default */ }
  if (pref === "system") {
    pref = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    try { localStorage.setItem("mgpref_theme", pref); } catch (e) {}
  }
  if (pref !== "light" && pref !== "dark") pref = "light";
  var darkColor = root.classList.contains("mg-dash") ? "#09090B" : "#13121E";
  if (pref === "light" || pref === "dark") {
    root.setAttribute("data-theme", pref);
    // Kulay ng address bar: sumusunod sa piniling itsura (kapag "system", ang media ng meta ang bahala)
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute("content", pref === "dark" ? darkColor : root.classList.contains("mg-dash") ? "#F7F7F8" : "#F6F4FE");
  } else root.removeAttribute("data-theme");
})();
