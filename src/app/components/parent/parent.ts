import { Component, Input } from '@angular/core';
import { Child } from '../child/child';
import { DataService } from '../../services/data-service';
import { map, Observable } from 'rxjs';
import { Datum, PesticideType } from '../../interfaces/res';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parent',
  imports: [Child, FormsModule, CommonModule],
  templateUrl: './parent.html',
  styleUrl: './parent.scss',
  providers: [DataService]
})
export class Parent {
  inputData1 = 'sss';

  inputServiceData = '丟進來讓大家一起使用啊';

  data: Observable<Datum[]> = new Observable<Datum[]>;

  getInput($event: string) {
    console.log('兒子丟過來的東西:' + $event);
  }

  constructor(private dataService: DataService) { }

  inputDataChange() {
    this.dataService.inputData = this.inputServiceData;
  }



  get() {
    this.data = this.dataService.getData().pipe(map(
      res => res.Data
    ));
    // .subscribe(
    //   // response => { // next
    //   //   console.log(response);
    //   // },
    //   // err => console.log('error', err),  // error
    //   // () => { // complete
    //   //   console.log('complete');
    //   // }
    //   // {
    //   //   next: (response) => {
    //   //     console.log(response);
    //   //   },
    //   //   error: (err) => console.log('error', err),
    //   //   complete: () => {
    //   //     console.log('complete');
    //   //   }
    //   // }
    //   res => { console.log(res.Data); }
    // );
  }

  post() {
    this.dataService.postData().subscribe(
      response => console.log(response)
    );
  }
}
