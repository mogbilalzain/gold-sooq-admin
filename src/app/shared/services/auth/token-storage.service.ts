import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  
  saveToken(token: string, remember = true): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  saveUser(user: any, remember = true): void {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    (remember ? localStorage : sessionStorage).setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  clear(): void {
    this.removeToken();
    this.removeUser();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

