import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
  // 預設路由：導向 Dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Dashboard 主頁面 - 顯示所有功能的 2x2 網格
  {
    path: 'dashboard',
    component: Dashboard,
    title: '首頁儀表板'
  },

  // 404 路由
  { path: '**', redirectTo: '/dashboard' }
];
