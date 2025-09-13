import { Pipe, PipeTransform } from '@angular/core';
import { TextObject } from '../interfaces/res';

@Pipe({
  name: 'mask',
  pure: false
})
export class MaskPipe implements PipeTransform {

  transform(value: TextObject, len: number = 3): string {
    return value.text.length > len ? `${value.text.substring(0, len)}***` : value.text;
  }

}
