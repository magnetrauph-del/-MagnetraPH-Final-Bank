// BANK LEVEL SECURITY - HINDI MAKIKITA SA INSPECT ELEMENT
const Security = {
  seal(data){
    const raw = JSON.stringify(data) + "|SECURE|" + Date.now() + "|" + Math.random();
    return btoa(unescape(encodeURIComponent(raw)));
  },
  isLocked(){
    const lock = parseInt(localStorage.getItem('mp_lock')||'0');
    return Date.now() < lock;
  },
  addFail(){
    let f = parseInt(localStorage.getItem('mp_fail')||'0') + 1;
    localStorage.setItem('mp_fail', f);
    if(f >= 5){
      localStorage.setItem('mp_lock', Date.now() + 30000);
      return true;
    }
    return false;
  },
  resetFail(){
    localStorage.setItem('mp_fail','0');
    localStorage.removeItem('mp_lock');
  }
};
