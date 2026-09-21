// functions/index.js - 20Y SEALED - TAGA IMPORT LANG - HINDI NAGLALAMAN LOGIC - HINDI MABUBURA
const admin = require("firebase-admin");
admin.initializeApp();

const login = require("./src/login");
const createaccount = require("./src/createaccount");
const dashboard = require("./src/dashboard");

exports.checkLoginAttempt = login.checkLoginAttempt;
exports.recordFail = login.recordFail;
exports.clearFailServer = login.clearFailServer;

exports.checkCreateAttempt = createaccount.checkCreateAttempt;
exports.getDashboardData = dashboard.getDashboardData;
