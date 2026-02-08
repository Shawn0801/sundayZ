import { Component } from '@angular/core';
import { Marquee } from '../marquee/marquee';
import { WeatherMain } from '../weather-main/weather-main';
import { Market } from '../market/market';
import { Spray } from '../spray/spray';
import { Journal } from '../journal/journal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    Marquee,
    WeatherMain,
    Market,
    Spray,
    Journal
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
