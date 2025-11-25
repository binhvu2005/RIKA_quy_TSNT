/**
 * Cookie utility functions
 */

/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration (default: 7)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Set secure and SameSite attributes for better security
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const sameSite = '; SameSite=Lax';
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${secure}${sameSite}`;
}

/**
 * Get a cookie value
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  
  return null;
}

/**
 * Delete a cookie
 * @param name - Cookie name
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

