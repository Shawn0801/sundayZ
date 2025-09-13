import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data-service';

@Component({
  selector: 'app-weather-info',
  imports: [],
  templateUrl: './weather-info.html',
  styleUrl: './weather-info.scss',
})
export class WeatherInfo {

  private dataService = inject(DataService);
  go() {
    console.log(this.dataService.inputData);
  }
}
