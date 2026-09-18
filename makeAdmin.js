const admin = require("firebase-admin");
admin.initializeApp();

async function makeAdmin(email) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, {admin: true});
  await admin.firestore().collection("admins").doc(user.uid).set({
    email: email,
    role: "superadmin",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log("Admin created:", email, user.uid);
}

makeAdmin("ILAGAY_MO_EMAIL_MO_DITO@gmail.com").then(()=>process.exit());
