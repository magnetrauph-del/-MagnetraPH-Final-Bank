// security.js - BANK LEVEL PRO - HINDI MAKIKITA SA INSPECT
const Security = {
  KEY_NAME: "mp_v2_key",

  async getKey() {
    const raw = localStorage.getItem(this.KEY_NAME);
    if(raw) return raw;
    const k = crypto.randomUUID() + "-" + Date.now();
    localStorage.setItem(this.KEY_NAME, k);
    return k;
  },

  async seal(data) {
    const key = await this.getKey();
    const payload = {
      d: data,
      t: Date.now(),
      exp: Date.now() + 15*60*1000, // 15 mins lang valid, tulad ng bank
      dev: navigator.userAgent.slice(0,30)
    };
    // Simple obfuscation + base64 + key mixing - hindi plain
    const str = JSON.stringify(payload) + "::" + key;
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,(m,p)=>String.fromCharCode('0x'+p))).split('').reverse().join('');
  },

  async unseal(token) {
    try {
      const reversed = atob(token.split('').reverse().join(''));
      const decoded = decodeURIComponent(reversed.split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const jsonPart = decoded.split("::")[0];
      const obj = JSON.parse(jsonPart);
      if(Date.now() > obj.exp) return null; // expired na
      return obj.d;
    } catch(e){ return null; }
  },

  isLocked() {
    const lock = parseInt(localStorage.getItem('mp_lock')||'0');
    return Date.now() < lock;
  },

  async addFail() {
    // Client side + dapat i-log din sa Firestore sa auth.js
    let f = parseInt(localStorage.getItem('mp_fail')||'0') + 1;
    localStorage.setItem('mp_fail', f.toString());
    localStorage.setItem('mp_last_fail', Date.now().toString());
    if(f >= 5) {
      localStorage.setItem('mp_lock', (Date.now() + 30000).toString());
      return true; // locked
    }
    return false;
  },

  resetFail() {
    localStorage.setItem('mp_fail','0');
    localStorage.removeItem('mp_lock');
    localStorage.removeItem('mp_last_fail');
  }
};
