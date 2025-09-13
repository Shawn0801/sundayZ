import { DataService } from './../../services/data-service';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { day } from '../../core/enums/day';


@Component({
  selector: 'app-child',
  imports: [],
  templateUrl: './child.html',
  styleUrl: './child.scss',
  providers: [DataService]
})
export class Child implements OnChanges {

  // @Input({ transform: (value: string) => value.toUpperCase() }) data = '';
  @Input({
    required: true,
    transform: (value: string) => value.toUpperCase(),
    alias: 'aaa'
  }) data = '';

  trimAndUppercase(value: string): string {
    return value.trim().toUpperCase();
  }
  @Output() emitEvent = new EventEmitter<string>();

  private dataService = inject(DataService);

  emitData() {
    this.emitEvent.emit('zzz');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes['data']);
  }

  ngOnInit() {
    console.log('初始化');
  }


  ngDoCheck(): void {
    console.log('check');
  }

  ngAfterContentInit(): void {
    console.log('ngcont');
  }

  ngOnDestroy(): void {
    console.log('銷毀');
  }


  getServiceData() {
    console.log(this.dataService.inputData);
  }

}
