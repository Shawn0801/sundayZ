import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBasicHighlight]',
  standalone: true
})
export class BasicHighlight {
  @Input() highlightColor: string = '#FFABFF';
  @Input() defaultColor: string = 'transparent';

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'background-color',
      this.defaultColor
    );
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'background-color',
      this.highlightColor
    );
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'background-color',
      this.defaultColor
    );
  }
}
