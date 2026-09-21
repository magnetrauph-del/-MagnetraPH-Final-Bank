// functions/src/dashboard.js - DASHBOARD UTAK ONLY
const functions = require("firebase-functions");
exports.getDashboardData = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Auth required');
  if (!context.app) throw new functions.https.HttpsError('failed-precondition','AppCheck required');
  return {ok:true, data:'dashboard secured'};
});
