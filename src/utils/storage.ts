const LocalStorage = {
  setItem(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key: string) {
    return JSON.parse(window.localStorage.getItem(key) || "");
  },
  removeItem(key: string) {
    window.localStorage.removeItem(key);
  },
  clear() {
    window.localStorage.clear();
  },
};

const SessionStorage = {
  setItem(key: string, value: any) {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key: string) {
    return JSON.parse(window.sessionStorage.getItem(key) || "");
  },
  removeItem(key: string) {
    window.sessionStorage.removeItem(key);
  },
  clear() {
    window.sessionStorage.clear;
  },
};

const Cookie = {
  setCookie(name: string, value: string) {
    const expires = new Date();
    const oneDayTime = 24 * 60 * 60 * 1000; // ms
    expires.setTime(expires.getTime() + oneDayTime);
    document.cookie = `${name}=${escape(
      value
    )};expires=${expires.toUTCString()}`;
  },
  getCookie(name: string) {
    const flag = `${name}=`;
    const cookies = document.cookie.split(";");
    for (let item of cookies) {
      item = item.trim();
      if (item.indexOf(flag) > -1) {
        return unescape(item.substr(flag.length));
      }
    }
    return "";
  },
  deleteCookie(name: string) {
    const expires = new Date();
    const oneDayTime = 24 * 60 * 60 * 1000;
    const value = this.getCookie(name);
    expires.setTime(expires.getTime() - oneDayTime);
    document.cookie = `${name}=${escape(value)};expires=${expires.toUTCString()}`;
  }
};

export { LocalStorage, SessionStorage, Cookie};
