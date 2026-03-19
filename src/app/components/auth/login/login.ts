import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    DividerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  private returnUrl: string = '/dashboard';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // 從查詢參數取得 returnUrl
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }



  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: async (userCredential) => {
        // 提取並儲存 token
        const token = await userCredential.user.getIdToken();
        this.authService.saveToken(token);

        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error.code);
      }
    });
  }

  loginWithGoogle(): void {
    this.loading = true;
    this.errorMessage = null;

    this.authService.loginWithGoogle().subscribe({
      next: async (userCredential) => {
        // 提取並儲存 token
        const token = await userCredential.user.getIdToken();
        this.authService.saveToken(token);

        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error.code);
      }
    });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '找不到此帳號';
      case 'auth/wrong-password':
        return '密碼錯誤';
      case 'auth/invalid-email':
        return '電子郵件格式不正確';
      case 'auth/user-disabled':
        return '此帳號已被停用';
      case 'auth/too-many-requests':
        return '嘗試次數過多，請稍後再試';
      case 'auth/popup-closed-by-user':
        return 'Google 登入視窗已關閉';
      default:
        return '登入失敗，請稍後再試';
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
