import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherMain } from './weather-main';

describe('WeatherMain', () => {
  let component: WeatherMain;
  let fixture: ComponentFixture<WeatherMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherMain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
