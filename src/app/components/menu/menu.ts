import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuStateService } from '../../services/menu-state.service';

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

  items = signal<MenuItem[]>([]);

  // 使用服務中的狀態
  isCollapsed = this.menuStateService.isCollapsed;

  ngOnInit(): void {
    this.items.set([
      { label: '首頁儀表板', icon: 'pi pi-home', routerLink: '/dashboard' },
      { label: '交易行情', icon: 'pi pi-chart-line', routerLink: '/market' },
      { label: '田間日誌', icon: 'pi pi-book', routerLink: '/journal' },
    ]);
  }

  toggleMenu(): void {
    this.menuStateService.toggleMenu();
  }

}
