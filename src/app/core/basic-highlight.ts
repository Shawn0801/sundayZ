import { Directive, ElementRef, HostBinding, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBasicHighlight]'
})
export class BasicHighlight {

  constructor(
    private elementRef: ElementRef,
    private render: Renderer2
  ) { }

  ngOnInit(): void {
    this.elementRef.nativeElement.style.backgroundColor = '#12031dff';
  }

  @HostBinding('style.backgroundColor') backgroundColor: string = '#CFCFCF';


  @HostListener('mouseenter', ['$event']) mouseenter(eventData: Event) {
    this.render.setStyle(this.elementRef.nativeElement, 'background-color', '#FFABFF');

  }

  @HostListener('mouseleave', ['$event']) mouseleave(eventData: Event) {
    this.render.setStyle(this.elementRef.nativeElement, 'background-color', 'transparent');
  }
}
