import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ChaosConfigDto, ChaosRule, ChaosTarget } from '@ci-cd/shared-types';
import { sleep } from '../common/async';

export const CHAOS_TARGETS: readonly ChaosTarget[] = [
  'products',
  'inventory',
  'payment',
  'notification',
];

const defaultConfig = (): ChaosConfigDto => ({
  products: { latencyMs: 0, errorRate: 0 },
  inventory: { latencyMs: 0, errorRate: 0 },
  payment: { latencyMs: 0, errorRate: 0 },
  notification: { latencyMs: 0, errorRate: 0 },
});

export class ChaosInjectedError extends ServiceUnavailableException {
  constructor(readonly target: ChaosTarget) {
    super(`Falha injetada pelo chaos em "${target}"`);
  }
}

/**
 * Guarda em memória a configuração de latência e falhas por serviço.
 * Cada serviço chama `apply(target)` no início da operação.
 */
@Injectable()
export class ChaosService {
  private readonly logger = new Logger(ChaosService.name);
  private config = defaultConfig();

  getConfig(): ChaosConfigDto {
    return structuredClone(this.config);
  }

  update(patch: Partial<Record<ChaosTarget, ChaosRule>>): ChaosConfigDto {
    for (const target of CHAOS_TARGETS) {
      const rule = patch[target];
      if (rule) this.config[target] = { ...rule };
    }
    this.logger.log(`Configuração atualizada: ${JSON.stringify(this.config)}`);
    return this.getConfig();
  }

  reset(): ChaosConfigDto {
    this.config = defaultConfig();
    this.logger.log('Configuração resetada');
    return this.getConfig();
  }

  async apply(target: ChaosTarget): Promise<void> {
    const { latencyMs, errorRate } = this.config[target];
    if (latencyMs > 0) await sleep(latencyMs);
    if (errorRate > 0 && Math.random() < errorRate) {
      this.logger.warn(`Injetando falha em "${target}"`);
      throw new ChaosInjectedError(target);
    }
  }
}
