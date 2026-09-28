import { ChaosInjectedError, ChaosService } from './chaos.service';

describe('ChaosService', () => {
  let chaos: ChaosService;

  beforeEach(() => {
    chaos = new ChaosService();
  });

  it('não interfere quando a configuração está zerada', async () => {
    await expect(chaos.apply('payment')).resolves.toBeUndefined();
  });

  it('lança ChaosInjectedError quando errorRate = 1', async () => {
    chaos.update({ payment: { latencyMs: 0, errorRate: 1 } });
    await expect(chaos.apply('payment')).rejects.toBeInstanceOf(ChaosInjectedError);
    await expect(chaos.apply('inventory')).resolves.toBeUndefined();
  });

  it('injeta latência configurada', async () => {
    chaos.update({ inventory: { latencyMs: 50, errorRate: 0 } });
    const start = Date.now();
    await chaos.apply('inventory');
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });

  it('reset volta ao padrão', () => {
    chaos.update({ products: { latencyMs: 1000, errorRate: 0.5 } });
    expect(chaos.reset().products).toEqual({ latencyMs: 0, errorRate: 0 });
  });

  it('getConfig devolve uma cópia', () => {
    chaos.getConfig().payment.errorRate = 1;
    expect(chaos.getConfig().payment.errorRate).toBe(0);
  });
});
