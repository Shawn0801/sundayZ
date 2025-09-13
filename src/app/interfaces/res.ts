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


export interface TextObject { text: string; }
