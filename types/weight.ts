export interface BatchItem {
  id: number;
  val: number;
}

export interface Batch {
  id: number;
  items: BatchItem[];
}

export interface ExportMetadata {
  date: string;
  farmer: string;
  origin: string;
  driver: string;
  basketWeight: number;
}