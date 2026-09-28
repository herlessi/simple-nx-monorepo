/** Corpo padrão de erro devolvido pela API. */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error?: string;
  /** Presente quando o erro aconteceu depois que o pedido foi criado. */
  orderId?: string;
  path: string;
  timestamp: string;
}
