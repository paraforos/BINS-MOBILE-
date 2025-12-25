
export interface BinReportData {
  supplierName: string;
  driverName: string;
  product: string;
  totalBins: string;
  brokenBins: string;
  photos: string[]; // Base64 strings
}

export enum Step {
  Supplier = 0,
  Driver = 1,
  Product = 2,
  TotalBins = 3,
  BrokenBins = 4,
  Photos = 5,
  Summary = 6
}
