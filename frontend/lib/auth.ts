import Cookies from 'js-cookie';
import { User } from '@/types';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const USER_KEY = 'user';

export const setAuthCookies = (token: string, user: User) => {
  Cookies.set(ACCESS_TOKEN_KEY, token, { expires: 7, sameSite: 'strict' });
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7, sameSite: 'strict' });
};

export const clearAuthCookies = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(USER_KEY);
};

export const getStoredUser = () => {
  const raw = Cookies.get(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};
