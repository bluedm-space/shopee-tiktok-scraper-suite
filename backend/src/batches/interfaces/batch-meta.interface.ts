export interface BatchMeta {
  batchId: string;
  filename: string;
  createdAt: string;
  totalOrders: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
}
