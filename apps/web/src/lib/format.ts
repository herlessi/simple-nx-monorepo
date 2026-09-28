const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPrice = (cents: number) => currency.format(cents / 100);
