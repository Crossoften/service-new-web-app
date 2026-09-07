import { PrismaClient } from '@prisma/client';

/**
 * Seed das categorias de catálogo que ainda não eram semeadas:
 * produtos (Compra e Venda / Aluguel), hospedagem e transporte.
 *
 * Espelha o padrão de `service-category.seeds.ts` (upsert por `slug`, idempotente).
 * Ícones ficam nulos por enquanto — o front usa fallback e o cadastro do fornecedor
 * passa a ter opções válidas (o back valida `categoryId` contra estas tabelas).
 *
 * Uso: importe e chame em `prisma/seeds/index.ts` (ver instruções no fim do arquivo).
 */

interface CategoryDef {
  name: string;
  slug: string;
  sortOrder: number;
}

const productCategories: CategoryDef[] = [
  { name: 'Veículos', slug: 'veiculos', sortOrder: 1 },
  { name: 'Eletrônicos', slug: 'eletronicos', sortOrder: 2 },
  { name: 'Eletrodomésticos', slug: 'eletrodomesticos', sortOrder: 3 },
  { name: 'Móveis', slug: 'moveis', sortOrder: 4 },
  { name: 'Imóveis', slug: 'imoveis', sortOrder: 5 },
  { name: 'Moda e Acessórios', slug: 'moda-acessorios', sortOrder: 6 },
  { name: 'Ferramentas', slug: 'ferramentas', sortOrder: 7 },
  { name: 'Esporte e Lazer', slug: 'esporte-lazer', sortOrder: 8 },
  { name: 'Infantil', slug: 'infantil', sortOrder: 9 },
  { name: 'Outros', slug: 'produtos-outros', sortOrder: 99 },
];

const accommodationCategories: CategoryDef[] = [
  { name: 'Hotel', slug: 'hotel', sortOrder: 1 },
  { name: 'Pousada', slug: 'pousada', sortOrder: 2 },
  { name: 'Casa', slug: 'casa', sortOrder: 3 },
  { name: 'Apartamento', slug: 'apartamento', sortOrder: 4 },
  { name: 'Chalé', slug: 'chale', sortOrder: 5 },
  { name: 'Flat', slug: 'flat', sortOrder: 6 },
  { name: 'Hostel', slug: 'hostel', sortOrder: 7 },
  { name: 'Resort', slug: 'resort', sortOrder: 8 },
  { name: 'Outros', slug: 'hospedagem-outros', sortOrder: 99 },
];

const transportationCategories: CategoryDef[] = [
  { name: 'Carro', slug: 'carro', sortOrder: 1 },
  { name: 'Moto', slug: 'moto', sortOrder: 2 },
  { name: 'Van', slug: 'van', sortOrder: 3 },
  { name: 'Caminhão', slug: 'caminhao', sortOrder: 4 },
  { name: 'Ônibus', slug: 'onibus', sortOrder: 5 },
  { name: 'Utilitário', slug: 'utilitario', sortOrder: 6 },
  { name: 'Outros', slug: 'transporte-outros', sortOrder: 99 },
];

export async function seedCatalogCategories(prisma: PrismaClient) {
  for (const c of productCategories) {
    await prisma.productCategory.upsert({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
      update: { name: c.name, sortOrder: c.sortOrder },
    });
  }

  for (const c of accommodationCategories) {
    await prisma.accommodationCategory.upsert({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
      update: { name: c.name, sortOrder: c.sortOrder },
    });
  }

  for (const c of transportationCategories) {
    await prisma.transportationCategory.upsert({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
      update: { name: c.name, sortOrder: c.sortOrder },
    });
  }
}

/*
 * ── Como registrar (no back-end `service-new-ws`) ────────────────────────────
 * 1. Salve este arquivo como `prisma/seeds/catalog-categories.seeds.ts`.
 * 2. Em `prisma/seeds/index.ts`, adicione:
 *
 *      import { seedCatalogCategories } from './catalog-categories.seeds';
 *      // ...dentro de main(), junto dos demais seeds:
 *      await seedCatalogCategories(prisma);
 *
 * 3. Rode o seed (ex.: `npm run seed` / `prisma db seed`, conforme o projeto).
 *
 * É idempotente (upsert por slug) — pode rodar quantas vezes quiser.
 */
