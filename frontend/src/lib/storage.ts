/**
 * Safely sets a cookie on the client side.
 */
function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
}

/**
 * Safely gets a cookie value by name on the client side.
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  return null;
}

/**
 * Safely deletes a cookie by name on the client side.
 */
function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

/**
 * Safely sets an item in localStorage and synchronized cookies.
 */
export function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
  setCookie(key, value);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-storage-change"));
  }
}

/**
 * Safely gets an item from localStorage (falling back to cookies).
 */
export function getStorageItem(key: string): string | null {
  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;
  } catch {}
  return getCookie(key);
}

/**
 * Safely removes an item from localStorage and cookies.
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
  removeCookie(key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-storage-change"));
  }
}

/**
 * Safely sets multiple items in localStorage and cookies (bulk write).
 */
export function setStorageItems(items: Record<string, string>): void {
  try {
    Object.entries(items).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch {}
  Object.entries(items).forEach(([key, value]) => {
    setCookie(key, value);
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-storage-change"));
  }
}

/**
 * Safely removes multiple items from localStorage and cookies (bulk delete).
 */
export function removeStorageItems(keys: string[]): void {
  try {
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch {}
  keys.forEach((key) => {
    removeCookie(key);
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-storage-change"));
  }
}
