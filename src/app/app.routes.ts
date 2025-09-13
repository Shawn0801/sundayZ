import { Routes } from '@angular/router';
import { Table } from './components/table/table';
import { Form } from './components/form/form';
import { Home } from './components/home/home';
import { Child } from './components/child/child';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
    children: [
      {
        path: 'table',
        component: Table
      },
    ]
  },
  {
    path: 'fff',
    redirectTo: '/table',
    pathMatch: 'prefix'
  },
  {
    path: 'table',
    component: Table
  },
  {
    path: 'child',
    component: Child
  },
  {
    path: 'form',
    component: Form
  }
];
