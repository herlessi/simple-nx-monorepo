import { formatPrice } from '../src/lib/format';

describe('formatPrice', () => {
  it('formata centavos como BRL', () => {
    expect(formatPrice(3890).replace(/\s/g, ' ')).toBe('R$ 38,90');
  });

  it('formata zero', () => {
    expect(formatPrice(0).replace(/\s/g, ' ')).toBe('R$ 0,00');
  });
});
