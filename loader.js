
const admin = require("firebase-admin");
var serviceAccount = require("./config/generate-firebase-credential")();
module.exports = function () {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

