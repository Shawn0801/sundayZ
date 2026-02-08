import { Injectable } from '@angular/core';
import { day } from '../core/enums/day';
import { HttpClient } from '@angular/common/http';
import { PesticideType, WeatherInfo } from '../interfaces/PesticideTypeRes';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  inputData = 'aaa';

  selectedDay: day = 1;


  getData() {
    const url = 'https://data.moa.gov.tw/api/v1/PesticideType/';
    return this.http.get<PesticideType>(url);
  }

  getWeather() {
    const url = 'https://data.moa.gov.tw/api/v1/AutoWeatherStationType/';
    return this.http.get<WeatherInfo>(url);
  }

  postData() {
    const url = '/api/front/statistics/export';
    const postData = { format: 'json', type: 'category' };
    return this.http.post<any[]>(url, postData);
  }






}
