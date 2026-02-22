import { MoaApiBaseResponse } from './MoaApiBaseResponse';

export interface AutoWeatherStation {
  Start_time: string;
  End_time: string;
  Station_name: string;
  Station_ID: string;
  Station_Latitude: number;
  Station_Longitude: number;
  TIME: string;
  ELEV: number;
  WDIR: number;
  WDSD: number;
  TEMP: number;
  HUMD: number;
  PRES: number;
  SUN: number;
  H_24R: number;
  CITY: string;
  CITY_SN: number;
  TOWN: string;
  TOWN_SN: number;
  /** 虛擬計算欄位：土壤濕度估算（0-100） */
  VIRTUAL_SOIL_HUMD: number;
}

export interface AutoWeatherStationRes extends MoaApiBaseResponse<AutoWeatherStation> {}
