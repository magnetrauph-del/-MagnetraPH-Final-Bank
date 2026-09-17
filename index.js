import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";

initializeApp();
const db = getFirestore();
const authAdmin = getAuth();

// Rate limit simple - anti bot pag million na
const rateLimit = new Map();
function checkRate(uid, limit = 10) {
  const now = Date.now();
  const arr = (rateLimit.get(uid) || []).filter(t => now - t < 60000);
  if (arr.length >= limit) throw new HttpsError("resource-exhausted", "Too many attempts");
  arr.push(now); rateLimit.set(uid, arr);
}

export const createPasskeyOptions = onCall({ enforceAppCheck: true, minInstances: 1, maxInstances: 100 }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated");
  checkRate(req.auth.uid, 5);
  const user = await authAdmin.getUser(req.auth.uid);
  const opts = await generateRegistrationOptions({
    rpName: "MagnetraPH", rpID: "magnetra-ultra.web.app",
    userID: req.auth.uid, userName: user.email,
    attestationType: "none",
    authenticatorSelection: { residentKey: "preferred", userVerification: "required" }
  });
  await db.collection("passkey_challenge").doc(req.auth.uid).set({ challenge: opts.challenge, exp: Date.now() + 120000 });
  return opts;
});

export const verifyPasskeyRegistration = onCall({ enforceAppCheck: true, minInstances: 1 }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated");
  const doc = await db.collection("passkey_challenge").doc(req.auth.uid).get();
  if (!doc.exists) throw new HttpsError("failed-precondition");
  const { challenge } = doc.data();
  const ver = await verifyRegistrationResponse({
    response: req.data.credential, expectedChallenge: challenge,
    expectedOrigin: ["https://magnetra-ultra.web.app","https://magnetra-ultra.firebaseapp.com","http://localhost:5000"],
    expectedRPID: "magnetra-ultra.web.app"
  });
  if (!ver.verified) throw new HttpsError("invalid-argument");
  await db.collection("passkeys").doc(req.auth.uid).set({
    id: ver.registrationInfo.credentialID,
    publicKey: Buffer.from(ver.registrationInfo.credentialPublicKey).toString("base64"),
    counter: ver.registrationInfo.counter,
    email: req.auth.token.email,
    created: Date.now()
  });
  return { ok: true };
});

export const createPasskeyLoginOptions = onCall({ enforceAppCheck: true, minInstances: 1, maxInstances: 200 }, async (req) => {
  const email = req.data.email?.toLowerCase();
  if (!email) throw new HttpsError("invalid-argument");
  checkRate(email, 10);
  // hanapin uid via email
  let uid;
  try { const u = await authAdmin.getUserByEmail(email); uid = u.uid; } catch { throw new HttpsError("not-found"); }
  const pass = await db.collection("passkeys").doc(uid).get();
  if (!pass.exists) throw new HttpsError("not-found");
  const opts = await generateAuthenticationOptions({ rpID: "magnetra-ultra.web.app", allowCredentials: [{ id: pass.data().id, type: "public-key" }], userVerification: "required" });
  await db.collection("passkey_challenge").doc(uid).set({ challenge: opts.challenge, exp: Date.now() + 120000 });
  return { options: opts, uid };
});

export const verifyPasskeyLogin = onCall({ enforceAppCheck: true, minInstances: 1, maxInstances: 200 }, async (req) => {
  const { credential, uid } = req.data;
  checkRate(uid, 10);
  const chalDoc = await db.collection("passkey_challenge").doc(uid).get();
  const passDoc = await db.collection("passkeys").doc(uid).get();
  if (!chalDoc.exists || !passDoc.exists) throw new HttpsError("failed-precondition");
  const pass = passDoc.data();
  const ver = await verifyAuthenticationResponse({
    response: credential, expectedChallenge: chalDoc.data().challenge,
    expectedOrigin: ["https://magnetra-ultra.web.app","https://magnetra-ultra.firebaseapp.com","http://localhost:5000"],
    expectedRPID: "magnetra-ultra.web.app",
    authenticator: { credentialID: pass.id, credentialPublicKey: Buffer.from(pass.publicKey,"base64"), counter: pass.counter }
  });
  if (!ver.verified) throw new HttpsError("unauthenticated");
  await db.collection("passkeys").doc(uid).update({ counter: ver.authenticationInfo.newCounter });
  const token = await authAdmin.createCustomToken(uid);
  return { token };
});
