import { Component } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router, RouterOutlet, } from '@angular/router';
import { Subscription } from 'rxjs';
import { Table } from '../table/table';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [FormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})
export class Form {
  private subscription = new Subscription();


  citySelect = [
    { label: '台北市', value: '台北市' },
    { label: '新北市', value: '新北市' },
    { label: '基隆市', value: '基隆市' }
  ];

  id = '我從ts來';

  constructor(private router: Router) {
    this.subscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) { // router 開始
        console.log('NavigationStart', event);
      }

      if (event instanceof NavigationEnd) { // router 完成轉導後
        console.log('NavigationEnd', event);
      }
    });
  }

  onSumbit(form: NgForm) {
    console.log('送出');
    console.log(form);
  }

  redirectTable() {
    // this.router.navigateByUrl('/home/table?id=aaa');
    this.router.navigate(['/home/table'], { queryParams: { id: 'aaa' } });
  }
}
