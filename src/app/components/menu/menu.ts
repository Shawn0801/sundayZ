import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  items = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.items.set([
      { label: '首頁儀表板', icon: 'pi pi-home', routerLink: '/dashboard' }
    ]);
  }

}
