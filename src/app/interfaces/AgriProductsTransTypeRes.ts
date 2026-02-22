import { MoaApiBaseResponse } from './MoaApiBaseResponse';

export interface AgriProduct {
  TransDate: string;
  TcType: string;
  CropCode: string;
  CropName: string;
  MarketCode: string;
  MarketName: string;
  Upper_Price: number;
  Middle_Price: number;
  Lower_Price: number;
  Avg_Price: number;
  Trans_Quantity: number;
}

export interface AgriProductsTransTypeRes extends MoaApiBaseResponse<AgriProduct> {}
