import { CommonModule, LowerCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MaskPipe } from "../../pipes/mask-pipe";
import { FormsModule } from '@angular/forms';
import { TextObject } from '../../interfaces/res';

@Component({
  selector: 'app-pipe',
  imports: [CommonModule, FormsModule, MaskPipe],
  templateUrl: './pipe.html',
  styleUrl: './pipe.scss',
  providers: [LowerCasePipe] //註冊
})
export class Pipe {
  text = 'PipegoGo';
  testMask: TextObject = {
    text: 'test'
  };
  now = new Date();
  constructor(private lowerCasePipe: LowerCasePipe) { }
  ngOnInit(): void {
    this.text = this.lowerCasePipe.transform(this.text);
  }


}
