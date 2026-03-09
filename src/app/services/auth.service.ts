import { Injectable, inject } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from '@angular/fire/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);

  // Observable of the current user
  user$: Observable<User | null> = user(this.auth);

  // BehaviorSubject to track authentication state
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Check if user is authenticated
  public isAuthenticated$ = this.user$.pipe(
    map(user => !!user)
  );

  constructor() {
    // Listen to auth state changes
    this.user$.subscribe(firebaseUser => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        this.currentUserSubject.next(authUser);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  /**
   * Register a new user with email and password
   */
  register(email: string, password: string, displayName?: string): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(credential => {
        // Update display name if provided
        if (displayName && credential.user) {
          return updateProfile(credential.user, { displayName }).then(() => credential);
        }
        return credential;
      })
    );
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  /**
   * Login with Google
   */
  loginWithGoogle(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  /**
   * Logout current user
   */
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  /**
   * Send password reset email
   */
  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  /**
   * Update user profile
   */
  updateUserProfile(displayName: string, photoURL?: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    const profile: { displayName: string; photoURL?: string } = { displayName };
    if (photoURL) {
      profile.photoURL = photoURL;
    }

    return from(updateProfile(user, profile));
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Get current auth user
   */
  getCurrentAuthUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get ID token for the current user
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) {
      return null;
    }
    return await user.getIdToken(forceRefresh);
  }

  /**
   * Save token to local storage
   */
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get token from local storage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Remove token from local storage
   */
  removeToken(): void {
    localStorage.removeItem('auth_token');
  }
}
