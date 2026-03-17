import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuStateService } from '../../services/menu-state.service';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Observable } from 'rxjs';

// 自訂 MenuItem 介面
interface MenuItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit {
  private menuStateService = inject(MenuStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  items = signal<MenuItem[]>([]);

  // 使用服務中的狀態
  isCollapsed = this.menuStateService.isCollapsed;

  // 當前使用者資訊
  currentUser$: Observable<AuthUser | null> = this.authService.currentUser$;

  ngOnInit(): void {
    this.items.set([
      { label: '首頁儀表板', icon: 'pi pi-home', routerLink: '/dashboard' },
      { label: '交易行情', icon: 'pi pi-chart-line', routerLink: '/market' },
      { label: '田間日誌', icon: 'pi pi-book', routerLink: '/journal' },
      { label: '偵測蟲害助手', icon: 'pi pi-bolt', routerLink: '/insectDamge' },
    ]);
  }

  toggleMenu(): void {
    this.menuStateService.toggleMenu();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('登出失敗:', error);
      }
    });
  }

}
