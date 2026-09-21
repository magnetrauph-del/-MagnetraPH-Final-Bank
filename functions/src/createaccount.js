// functions/src/createaccount.js - CREATE ACCOUNT UTAK ONLY
const functions = require("firebase-functions");
exports.checkCreateAttempt = functions.https.onCall(async (data, context) => {
  if (!context.app) throw new functions.https.HttpsError('failed-precondition','AppCheck required');
  return {ok:true};
});
