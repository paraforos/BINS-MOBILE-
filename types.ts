
export interface BinReportData {
  supplierName: string;
  driverName: string;
  product: string;
  totalBins: string;
  brokenBins: string;
  photos: string[]; // Base64 strings
  comments: string;
}

export enum Step {
  Supplier = 0,
  Driver = 1,
  Product = 2,
  TotalBins = 3,
  BrokenBins = 4,
  Photos = 5,
  Comments = 6,
  Summary = 7
}

export enum AppView {
  Reporter = 'reporter',
  Management = 'management'
}
