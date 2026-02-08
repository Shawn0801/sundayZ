export interface PesticideType {
  RS: string;
  Data: Datum[];
  Next: boolean;
}

export interface Datum {
  PesticideID: string;
  PesticideName: string;
  PesticideEnName: string;
  PesticideCoaID: string;
  PesticideProductName: string;
}


export interface WeatherType {
  Station_name: string;
  Station_ID: string;
  TIME: string;
  Station_Latitude: string;
  Station_Longitude: string;
  ELEV: string;
  WDIR: string;
  WDSD: string;
  TEMP: string;
  HUMD: string;
  PRES: string;
  SUN: string;
  H_24R: string;
  H_FX: string;
  H_XD: string;
  H_FXT: string;
  D_TX: string;
  D_TXT: string;
  D_TN: string;
  D_TNT: string;
  CITY: string;
  CITY_SN: string;
  TOWN: string;
  TOWN_SN: string;
}

export interface WeatherInfo {
  RS: string;
  Data: WeatherType[];
  Next: boolean;
}

export interface TextObject { text: string; }
