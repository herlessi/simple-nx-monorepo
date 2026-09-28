export type ChaosTarget = 'products' | 'inventory' | 'payment' | 'notification';

export interface ChaosRule {
  /** Latência extra injetada antes da operação, em ms. */
  latencyMs: number;
  /** Probabilidade de falha, de 0 (nunca) a 1 (sempre). */
  errorRate: number;
}

export type ChaosConfigDto = Record<ChaosTarget, ChaosRule>;
