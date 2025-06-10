import { and, db, eq, isNull, SQL, sql } from '@repo/db';
import {
  customerPicTable,
  customerTable,
  type CustomerTypeEnum,
} from '@repo/db/model';

type Customer = typeof customerTable.$inferSelect;

export const getTotalCustomer = async (query: {
  customerType?: CustomerTypeEnum;
}) => {
  const where: SQL[] = [isNull(customerTable.deletedAt)];

  if (query.customerType) {
    where.push(eq(customerTable.customerType, query.customerType));
  }

  const data = await db.query.customerTable.findMany({
    where: and(...where),
    with: {
      customerPics: true,
    },
  });

  let total_customer = 0;
  let total_bank_data_customer = 0;
  let total_active_customer = 0;
  let total_inactive_customer = 0;
  let total_customer_with_pic = 0;
  let total_customer_without_pic = 0;

  for (const item of data) {
    if (item.status === 'ACTIVE') {
      total_active_customer++;
    }
    if (item.status === 'INACTIVE') {
      total_inactive_customer++;
    }
    if (item.status === 'BANK_DATA') {
      total_bank_data_customer++;
    }
    total_customer++;

    if (item.customerPics.length > 0) {
      total_customer_with_pic++;
    } else {
      total_customer_without_pic++;
    }
  }

  return {
    total_customer,
    total_bank_data_customer,
    total_active_customer,
    total_inactive_customer,
    total_customer_with_pic,
    total_customer_without_pic,
  };
};

export const getTotalRevenue = (_query: Partial<Customer>) => {
  return {
    '2019':
      Math.floor(Math.random() * (30000000000 - 100000000 + 1)) + 100000000,
    '2020':
      Math.floor(Math.random() * (30000000000 - 100000000 + 1)) + 100000000,
    '2021':
      Math.floor(Math.random() * (30000000000 - 100000000 + 1)) + 100000000,
    '2022':
      Math.floor(Math.random() * (30000000000 - 100000000 + 1)) + 100000000,
    '2023':
      Math.floor(Math.random() * (30000000000 - 100000000 + 1)) + 100000000,
    '2024':
      Math.floor(Math.random() * (30000000000 - 100000000 + 1)) + 100000000,
  };
};

export const getTotalCustomerByCountry = async (query: {
  customerType?: CustomerTypeEnum;
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(Number(query?.page) || 1, 1);
  const limit = Math.max(Number(query?.limit) || 10, 1);
  const offset = (page - 1) * limit;

  const where: SQL[] = [isNull(customerTable.deletedAt)];

  if (query.customerType) {
    where.push(eq(customerTable.customerType, query.customerType));
  }

  const data = await db
    .select({
      country: customerTable.country,
      total: sql<number>`COUNT(*)`.as('total'),
    })
    .from(customerTable)
    .where(and(...where))
    .groupBy(customerTable.country)
    .orderBy(sql`total DESC`)
    .limit(limit)
    .offset(offset);

  const totalCountResult = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${customerTable.country})`.as('count'),
    })
    .from(customerTable)
    .where(and(...where));

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { data, totalCount };
};

export const getRecentClosing = async (_query: Partial<Customer>) => {
  return [
    {
      customer_name: 'PT. BANK JAYA',
      closing_date: '2025-02-23',
      closing_balance: 0,
      marketing_name: 'John Doe',
    },
    {
      customer_name: 'PT. CEMARA',
      closing_date: '2025-02-22',
      closing_balance: 0,
      marketing_name: 'John Doe',
    },
    {
      customer_name: 'PT. NUSANTARA',
      closing_date: '2025-02-21',
      closing_balance: 0,
      marketing_name: 'John Doe',
    },
    {
      customer_name: 'PT. ANUGRAH',
      closing_date: '2025-02-20',
      closing_balance: 0,
      marketing_name: 'John Doe',
    },
  ];
};

export const getTotalCustomerBySector = async (query: {
  customerType?: CustomerTypeEnum;
}) => {
  const where: SQL[] = [isNull(customerTable.deletedAt)];

  if (query.customerType) {
    where.push(eq(customerTable.customerType, query.customerType));
  }

  const data = await db
    .select({
      sector: customerTable.sector,
      total: sql<number>`COUNT(*)`.as('total'),
    })
    .from(customerTable)
    .where(and(...where))
    .groupBy(customerTable.sector)
    .orderBy(sql`total DESC`);

  return data;
};

export const getTotalPicCustomer = async () => {
  const where: SQL[] = [isNull(customerPicTable.deletedAt)];

  const data = await db
    .select({
      position: customerPicTable.position,
      total: sql<number>`COUNT(*)`.as('total'),
    })
    .from(customerPicTable)
    .where(and(...where))
    .groupBy(customerPicTable.position)
    .orderBy(sql`total DESC`);

  return data;
};
