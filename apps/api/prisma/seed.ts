import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: 'Café especial 250g', description: 'Grãos 100% arábica, torra média.', emoji: '☕', priceCents: 3890, stock: 50 },
  { name: 'Caneca de cerâmica', description: 'Caneca artesanal de 350 ml.', emoji: '🍵', priceCents: 4990, stock: 30 },
  { name: 'Fone Bluetooth', description: 'Fone sem fio com cancelamento de ruído.', emoji: '🎧', priceCents: 29990, stock: 15 },
  { name: 'Teclado mecânico', description: 'Switches marrons, layout ABNT2.', emoji: '⌨️', priceCents: 45900, stock: 10 },
  { name: 'Mouse sem fio', description: 'Sensor óptico de 16.000 DPI.', emoji: '🖱️', priceCents: 18990, stock: 25 },
  { name: 'Mochila executiva', description: 'Compartimento para notebook de 15".', emoji: '🎒', priceCents: 24900, stock: 20 },
  { name: 'Garrafa térmica', description: 'Mantém a temperatura por 12 horas.', emoji: '🧴', priceCents: 12990, stock: 40 },
  { name: 'Livro: Observabilidade', description: 'Guia prático de logs, métricas e traces.', emoji: '📘', priceCents: 8990, stock: 35 },
  { name: 'Planta suculenta', description: 'Vaso de 10 cm, pouca rega.', emoji: '🪴', priceCents: 2990, stock: 60 },
  { name: 'Luminária de mesa', description: 'LED com 3 temperaturas de cor.', emoji: '💡', priceCents: 15990, stock: 18 },
  { name: 'Camiseta dev', description: 'Algodão, estampa "works on my machine".', emoji: '👕', priceCents: 7990, stock: 45 },
  { name: 'Relógio smart', description: 'Monitor cardíaco e GPS integrado.', emoji: '⌚', priceCents: 89900, stock: 8 },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({ data: products });
  console.log(`Seed concluído: ${products.length} produtos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
