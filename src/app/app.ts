import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WeatherMain } from './components/weather-main/weather-main';
import { Menu } from './components/menu/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    Menu,
    WeatherMain
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'sundayZ';
}
