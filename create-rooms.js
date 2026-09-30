// create-rooms.js - v11 - RETIRED. Hindi na ito nilo-load ng create.html at wala na itong ginagawa.
//
// Dati: gumagawa ito ng "room" sa Firestore (rooms/{roomId}) mula mismo sa browser pagkatapos mag-sign up.
// Tinanggal ang flow na iyon dahil:
//  - Sarado sa browser ang /rooms sa kasalukuyang Firestore Rules (walang match, kaya tanggi lahat ng read at write).
//  - Walang Firestore sa firebase-init.js, at hindi ito dapat idagdag para lang dito.
//  - Hindi pa verified ang bagong account sa oras ng sign up. Ang workspace o room ay gagawin sa Dashboard phase,
//    sa server (Worker), kung saan ang UID ay galing sa verified na token.
//
// Walang import, walang Firestore, walang localStorage at walang global dito.
// Puwede nang burahin ang file na ito kapag nakumpirmang wala nang ibang page na naglo-load nito.
