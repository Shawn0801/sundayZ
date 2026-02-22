import { MoaApiBaseResponse } from "./MoaApiBaseResponse";

export interface PlantEpidemicTypeRes extends MoaApiBaseResponse<PlantDatum> {
}

export interface PlantDatum {
  City: string;
  PlantName: string;
  Body: string;
  Prescription: string;
  Issue: string;
  Subject: string;
  PubDate: string;
}
