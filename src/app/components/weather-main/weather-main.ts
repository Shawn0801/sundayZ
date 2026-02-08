import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TaiwanMap } from '../taiwan-map/taiwan-map';


@Component({
  selector: 'app-weather-main',
  standalone: true,
  imports: [CardModule,
    TaiwanMap
  ],
  templateUrl: './weather-main.html',
  styleUrl: './weather-main.scss'
})
export class WeatherMain {
  // CWA-009D4E4A - 36B8 - 4BE3 - B383 - 9D9DDE2F118E

}
