// login-boot.js - v2 - classic script (hindi module). Sinisigurong lumalabas ang page kahit pumalya ang isang module.
// Kapag hindi gumana ang page, sinasabi kung aling file ang may problema (para maayos kahit sa phone).
(function () {
  var shown = false;
  var problems = []; // { load: true, file } o { load: false, text }
  var UI_FILES = ["login-rooms.js", "security-core-shared.js", "login-i18n.js", "exit-guard-shared.js"];

  function fileOf(u) { return String(u || "").split("#")[0].split("?")[0].split("/").pop(); }

  // Itinatala ang mga error habang naglo-load: hindi ma-load na file, o sirang code (hal. kulang na kopya)
  window.addEventListener("error", function (e) {
    var t = e && e.target;
    if (t && t !== window && t.tagName) { problems.push({ load: true, file: fileOf(t.src || t.href) }); return; }
    if (e && e.filename) {
      problems.push({ load: false, text: fileOf(e.filename) + ":" + (e.lineno || 0) + " " +
        String(e.message || "").replace(/^Uncaught\s+/, "").replace(/https?:\/\/\S+/g, "").slice(0, 100) });
    }
  }, true);

  function show() {
    if (shown) return;
    shown = true;
    var loader = document.getElementById("appLoader");
    if (loader) loader.classList.add("hide");
    var bg = document.getElementById("bg");
    if (bg) bg.classList.add("show");
  }

  function lang() {
    try { return localStorage.getItem("mgpref_lang") === "fil" ? "fil" : "en"; } catch (e) { return "en"; }
  }

  function say(extra) {
    var s = document.getElementById("status");
    if (!s) return;
    s.textContent = (lang() === "fil"
      ? "Hindi buong na-load ang page. I-refresh at subukan ulit."
      : "The page did not load completely. Refresh and try again.") + (extra ? " (" + extra + ")" : "");
  }

  // Alamin kung aling file ang kulang sa folder (hal. mali ang pangalan o hindi na-upload)
  function findMissing(done) {
    if (!window.fetch) { done(""); return; }
    var missing = [], left = UI_FILES.length;
    UI_FILES.forEach(function (f) {
      fetch(f, { cache: "no-store" })
        .then(function (r) { if (!r.ok) missing.push(f); }, function () { missing.push(f); })
        .then(function () { if (--left === 0) done(missing.length ? "missing: " + missing.join(", ") : ""); });
    });
  }

  window.addEventListener("load", function () { setTimeout(show, 300); });

  // Failsafe: kahit hindi pa "load" pagkalipas ng 5 segundo, ilabas ang page.
  // Sinasabing may problema lang kapag tapos nang mag-load ang page (o lumampas na ng 20 segundo),
  // para hindi ito lumabas habang naglo-load pa sa mabagal na internet.
  var started = Date.now();
  function check() {
    show();
    if (window.__magLoginReady) return;
    if (document.readyState !== "complete" && Date.now() - started < 20000) { setTimeout(check, 1000); return; }
    if (location.protocol === "file:") { say("open it over http or https, not as a file"); return; }
    for (var i = 0; i < problems.length; i++) {
      if (!problems[i].load) { say(problems[i].text); return; } // sirang code: ito ang pinakamalinaw
    }
    say(problems.length ? problems[0].file + " not loaded" : "");
    findMissing(function (m) { if (m && !window.__magLoginReady) say(m); });
  }
  setTimeout(check, 5000);
})();
