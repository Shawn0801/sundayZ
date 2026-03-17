import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsectDamge } from './insect-damge';

describe('InsectDamge', () => {
  let component: InsectDamge;
  let fixture: ComponentFixture<InsectDamge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsectDamge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsectDamge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
