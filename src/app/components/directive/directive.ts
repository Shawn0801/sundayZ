import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BasicHighlight } from '../../core/basic-highlight';

@Component({
  selector: 'app-directive',
  imports: [CommonModule, BasicHighlight],
  templateUrl: './directive.html',
  styleUrl: './directive.scss'
})
export class Directive {

  colorStatus = '淺';

  onChangeColorStatus() {
    this.colorStatus = this.colorStatus === '深' ? '淺' : '深';
  }

  getColor() {
    return this.colorStatus === '淺' ? '#9999FF' : '#0000D1';
  }
}
