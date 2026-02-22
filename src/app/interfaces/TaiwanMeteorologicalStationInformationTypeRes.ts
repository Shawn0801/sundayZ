import { MoaApiBaseResponse } from './MoaApiBaseResponse';

export interface TaiwanMeteorologicalStationInformation {
  Station_name: string;
  Station_ID: string;
  Station_Latitude: string;
  Station_Longitude: string;
  CITY: string;
  CITY_SN: string;
  TOWN: string;
  TOWN_SN: string;
}

export interface TaiwanMeteorologicalStationInformationTypeRes extends MoaApiBaseResponse<TaiwanMeteorologicalStationInformation> {}
