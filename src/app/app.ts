import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Menu } from './components/menu/menu';
import { MenuStateService } from './services/menu-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Menu,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'sundayZ';

  private menuStateService = inject(MenuStateService);

  // 暴露選單收合狀態給模板
  isCollapsed = this.menuStateService.isCollapsed;
}
