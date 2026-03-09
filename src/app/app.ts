import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Menu } from './components/menu/menu';
import { MenuStateService } from './services/menu-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    Menu,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'sundayZ';

  private menuStateService = inject(MenuStateService);

  // 根據選單狀態計算主要內容區的左邊距
  mainMarginLeft = computed(() => {
    return this.menuStateService.isCollapsed() ? '80px' : '256px';
  });
}
