import { and, db, inArray, sql } from '@repo/db';
import { customers, customersPics } from '@repo/db/model';

import { buildWhereClause } from '../../utils/whereClause';

type Customer = typeof customers.$inferSelect;

export const getTotalCustomer = async (query: Partial<Customer>) => {
  const whereConditions = buildWhereClause(customers, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db.query.customers.findMany({
    where: whereClause,
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
    if (item.status === 'Active') {
      total_active_customer++;
    }
    if (item.status === 'Inactive') {
      total_inactive_customer++;
    }
    if (item.status === 'Bank Data') {
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

export const getTotalRevenue = async (_query: Partial<Customer>) => {
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

export const getTotalCustomerByCountry = async (query: Partial<Customer>) => {
  const whereConditions = buildWhereClause(customers, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db
    .select({
      country: customers.country,
      total: sql<number>`COUNT(*)`.as('total'),
    })
    .from(customers)
    .where(whereClause)
    .groupBy(customers.country)
    .orderBy(sql`total DESC`);

  return data;
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

export const getTotalCustomerBySector = async (query: Partial<Customer>) => {
  const whereConditions = buildWhereClause(customers, query);
  const whereClause = whereConditions.length
    ? and(...whereConditions)
    : undefined;

  const data = await db
    .select({
      sector: customers.sector,
      total: sql<number>`COUNT(*)`.as('total'),
    })
    .from(customers)
    .where(whereClause)
    .groupBy(customers.sector)
    .orderBy(sql`total DESC`);

  return data;
};

export const getTotalPicCustomer = async (
  query: Partial<Customer> & { customerType?: 'International' | 'Domestic' }
) => {
  const customerWhereClause = buildWhereClause(customers, {
    customerType: query.customerType,
  });

  const whereClause = customerWhereClause.length
    ? and(
        inArray(
          customersPics.customerId,
          db
            .select({ id: customers.id })
            .from(customers)
            .where(and(...customerWhereClause))
        )
      )
    : undefined;

  const data = await db
    .select({
      position: customersPics.position,
      total: sql<number>`COUNT(*)`.as('total'),
    })
    .from(customersPics)
    .where(whereClause)
    .groupBy(customersPics.position)
    .orderBy(sql`total DESC`);

  return data;
};
