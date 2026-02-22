import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {
  private _isCollapsed = signal<boolean>(false);

  // 只讀的 signal，外部元件只能讀取不能直接修改
  readonly isCollapsed = this._isCollapsed.asReadonly();

  toggleMenu(): void {
    this._isCollapsed.set(!this._isCollapsed());
  }

  setCollapsed(collapsed: boolean): void {
    this._isCollapsed.set(collapsed);
  }
}
