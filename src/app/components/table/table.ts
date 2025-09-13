import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-table',
  imports: [FormsModule],
  templateUrl: './table.html',
  styleUrl: './table.scss'
})
export class Table implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  @Input() id = '';

  ngOnInit(): void {
    console.log(this.id);
    //#region 取得非必要參數
    // this.route.snapshot.queryParams['id']; // 取得當下參數值，官方後來建議改用 ParamMap 的方式取
    // const id = this.route.snapshot.queryParamMap; // 取得當下參數值
    // console.log(id);
    // this.route.queryParamMap.subscribe((params: ParamMap) => {   // 參數變動都會觸發
    //   const id = params.get('id');
    //   console.log(id);
    // });
    //#endregion
    console.log(this.route.snapshot.queryParams['id']); // 取得當下參數值，官方後來建議改用 ParamMap 的方式取

    const id2 = this.route.snapshot.paramMap.get('id'); // 取得當下參數值
    console.log('init：' + id2);
    this.route.paramMap.subscribe((params: ParamMap) => {   // 參數變動都會觸發
      const id = params.get('id');
      console.log('paramMap訂閱：' + id);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      console.log('onChang' + this.id);
    }


  }

  redirectTable() {
    this.router.navigateByUrl('/home/table?id=aaa');
    this.router.navigate(['/home/table'], { queryParams: { id: 'aaa' } });
  }

}
