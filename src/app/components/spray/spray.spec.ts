import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Spray } from './spray';

describe('Spray', () => {
  let component: Spray;
  let fixture: ComponentFixture<Spray>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spray]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Spray);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
