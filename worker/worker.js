// worker.js - magnetra-live-api v3
// Kailangan sa Settings > Variables and Secrets:
//   FIREBASE_PROJECT_ID, FIREBASE_PROJECT_NUMBER, SUPABASE_URL  (Text)
//   SUPABASE_SERVICE_ROLE                                       (Secret, hindi Text)
//     Tanggap ang bagong Supabase secret key (sb_secret_...) o ang lumang service_role key.
// Para lang sa DEV Worker (parehong worker.js, ibang settings), hiwalay sa kuwit:
//   ALLOWED_ORIGINS  hal. "http://localhost:8080"                 (Text)
//   ALLOWED_APP_IDS  App ID ng DEV web app sa Firebase            (Text)
//   Kapag wala ang dalawang ito, ang PROD na value sa ibaba ang gamit.

const ID_JWKS = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const AC_JWKS = "https://firebaseappcheck.googleapis.com/v1/jwks";
// Mga domain ng site sa PROD (origin lang, walang path). Idagdag/alisin kung magbago ang hosting.
const PROD_ORIGINS = [
  "https://magnetra.app",
  "https://www.magnetra.app",
  "https://magnetra-ultra.web.app",
  "https://magnetra-ultra.firebaseapp.com",
];
const RECENT_LOGIN_SECONDS = 300; // para sa pagbura ng account
// Ang web app lang ng MagnetraPH ang tatanggapin ng App Check (galing sa firebase-init.js; hindi ito secret).
// Kapag nagdagdag ka ng bagong app sa Firebase (hal. Android), idagdag din ang App ID nito dito.
const PROD_APP_IDS = ["1:114134928326:web:0ce9f84dc043128e7700c7"];

// https://domain (walang path at walang "/" sa dulo), o http://localhost / 127.0.0.1 para sa DEV/SPCK
const ORIGIN_OK = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d{1,5})?$|^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;
// Firebase App ID: "1:<project number>:web:<id>"
const APP_ID_OK = /^\d+:(\d+):(web|android|ios):[0-9a-f]+$/;

// Listahan mula sa Worker setting (hiwalay sa kuwit), o ang PROD na value kapag walang laman.
function listSetting(value, fallback) {
  const list = typeof value === "string" ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
  return list.length ? list : fallback;
}

// Mga origin at App ID na tatanggapin ng Worker na ito. Dapat galing ang bawat App ID sa parehong
// Firebase project ng Worker (FIREBASE_PROJECT_NUMBER), kaya hindi magagamit ng DEV Worker ang PROD
// App ID o ng PROD Worker ang DEV. Kapag mali ang setting: null, at tatanggi ang Worker (fail closed).
function accessConfig(e) {
  const origins = listSetting(e.ALLOWED_ORIGINS, PROD_ORIGINS);
  const appIds = listSetting(e.ALLOWED_APP_IDS, PROD_APP_IDS);
  if (!origins.every((o) => ORIGIN_OK.test(o))) return null;
  const project = String(e.FIREBASE_PROJECT_NUMBER || "");
  if (!project || !appIds.every((id) => { const m = APP_ID_OK.exec(id); return m && m[1] === project; })) return null;
  return { origins, appIds };
}

// Bagong Supabase secret key: sa "apikey" header lang. Lumang service_role key: sa dalawa.
function supabaseHeaders(key) {
  return key.startsWith("sb_secret_") ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

const b64u = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const dec = (s) => JSON.parse(new TextDecoder().decode(b64u(s)));

// Cache ng public keys ng Google sa loob ng Worker (mas mabilis). Kapag may bagong "kid"
// na wala sa cache (nag-rotate ang Google ng key), kukuha ulit nang isang beses.
const KEY_CACHE = new Map(); // url -> { keys, at }
const KEY_TTL_MS = 10 * 60 * 1000;

async function fetchKeys(jwksUrl) {
  const res = await fetch(jwksUrl, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!res.ok) throw new Error("jwks");
  const { keys } = await res.json();
  const list = Array.isArray(keys) ? keys : [];
  KEY_CACHE.set(jwksUrl, { keys: list, at: Date.now() });
  return list;
}

const MIN_REFETCH_MS = 60 * 1000;

async function findKey(jwksUrl, kid) {
  const c = KEY_CACHE.get(jwksUrl);
  if (c && Date.now() - c.at < KEY_TTL_MS) {
    const hit = c.keys.find((k) => k.kid === kid);
    if (hit) return hit;
    // Hindi kilalang kid: kukuha lang ulit kung lampas 1 minuto na mula sa huling kuha,
    // para hindi mapilit ng pekeng token ang Worker na kumuha sa bawat request.
    if (Date.now() - c.at < MIN_REFETCH_MS) return null;
  }
  return (await fetchKeys(jwksUrl)).find((k) => k.kid === kid) || null;
}

async function verifyJWT(token, jwksUrl, check) {
  if (typeof token !== "string" || token.length > 8192) throw new Error("bad");
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) throw new Error("bad");
  const [h, p, s] = parts;
  const header = dec(h), payload = dec(p);
  if (!header || typeof header !== "object" || !payload || typeof payload !== "object") throw new Error("bad");
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("alg");
  const jwk = await findKey(jwksUrl, header.kid);
  if (!jwk) throw new Error("kid");
  const key = await crypto.subtle.importKey(
    "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, b64u(s), new TextEncoder().encode(h + "." + p)
  );
  if (!ok) throw new Error("sig");
  const now = Math.floor(Date.now() / 1000);
  // Kailangang may exp at iat; dati, kapag wala ang mga ito ay lumulusot ang check
  if (typeof payload.exp !== "number" || payload.exp < now) throw new Error("exp");
  if (typeof payload.iat !== "number" || payload.iat > now + 60) throw new Error("iat");
  check(payload);
  return payload;
}

function corsHeaders(r, origins) {
  const origin = r.headers.get("Origin");
  const h = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Firebase-AppCheck",
    "Access-Control-Max-Age": "86400",
  };
  if (origins.includes(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

export default {
  async fetch(r, e) {
    const cfg = accessConfig(e);
    const H = corsHeaders(r, cfg ? cfg.origins : []);
    const send = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: H });

    if (r.method === "OPTIONS") return new Response(null, { status: 204, headers: H });

    const u = new URL(r.url);
    if (u.pathname === "/") {
      if (r.method === "GET" || r.method === "HEAD") return send({ status: "Magnetra OK" });
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...H, Allow: "GET, HEAD, OPTIONS" } });
    }

    // Kapag kulang ang settings, tumanggi (fail closed)
    if (!cfg || !e.FIREBASE_PROJECT_ID || !e.FIREBASE_PROJECT_NUMBER || !e.SUPABASE_URL || !e.SUPABASE_SERVICE_ROLE) {
      console.error("missing or invalid env");
      return send({ error: "Server error" }, 500);
    }

    /* ---------- Auth: ID token + App Check ---------- */
    let p;
    try {
      const a = r.headers.get("Authorization") || "";
      if (!a.startsWith("Bearer ")) return send({ error: "Unauthorized" }, 401);
      p = await verifyJWT(a.slice(7), ID_JWKS, (x) => {
        if (x.aud !== e.FIREBASE_PROJECT_ID) throw new Error("aud");
        if (x.iss !== `https://securetoken.google.com/${e.FIREBASE_PROJECT_ID}`) throw new Error("iss");
        if (typeof x.sub !== "string" || !x.sub || x.sub.length > 128) throw new Error("sub");
        // Dapat nasa nakaraan ang oras ng pag-login
        if (typeof x.auth_time !== "number" || x.auth_time > Math.floor(Date.now() / 1000) + 60) {
          throw new Error("auth_time");
        }
      });

      const ac = r.headers.get("X-Firebase-AppCheck");
      if (!ac) return send({ error: "Unauthorized" }, 401);
      await verifyJWT(ac, AC_JWKS, (x) => {
        const aud = Array.isArray(x.aud) ? x.aud : [x.aud];
        if (!aud.includes(`projects/${e.FIREBASE_PROJECT_NUMBER}`)) throw new Error("ac aud");
        if (x.iss !== `https://firebaseappcheck.googleapis.com/${e.FIREBASE_PROJECT_NUMBER}`) throw new Error("ac iss");
        if (!cfg.appIds.includes(x.sub)) throw new Error("ac app");
      });
    } catch (err) {
      console.error("auth failed:", err && err.message); // reason lang, walang token
      return send({ error: "Unauthorized" }, 401);
    }

    if (p.email_verified !== true) {
      return send({ error: "Email not verified", code: "email-not-verified" }, 403);
    }

    /* ---------- Routes ---------- */
    // Ang uid ay laging galing sa verified token, hindi kailanman sa request ng client.
    const uid = p.sub;
    const email = p.email || null;
    const sb = supabaseHeaders(e.SUPABASE_SERVICE_ROLE);

    try {
      if (u.pathname === "/api/signup" && r.method === "POST") {
        const res = await fetch(`${e.SUPABASE_URL}/rest/v1/profiles`, {
          method: "POST",
          headers: {
            ...sb,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=minimal",
          },
          body: JSON.stringify({ id: uid, email }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) {
          console.error("signup supabase status:", res.status);
          return send({ error: "Server error" }, 502);
        }
        return send({ ok: true });
      }

      if (u.pathname === "/api/account" && r.method === "DELETE") {
        const now = Math.floor(Date.now() / 1000);
        if (typeof p.auth_time !== "number" || now - p.auth_time > RECENT_LOGIN_SECONDS) {
          return send({ error: "Recent login required", code: "recent-login" }, 403);
        }
        const res = await fetch(
          `${e.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(uid)}`,
          {
            method: "DELETE",
            headers: { ...sb, Prefer: "return=minimal" },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (!res.ok) {
          console.error("delete supabase status:", res.status);
          return send({ error: "Server error" }, 502);
        }
        return send({ ok: true });
      }

      return send({ error: "Not found" }, 404);
    } catch (err) {
      console.error("route error:", err && err.message);
      return send({ error: "Server error" }, 500);
    }
  },
};
