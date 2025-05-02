import { getCustomers } from './controllers/master-data/customer.controller';
import { createUser, listUsers } from './user';

export const router = {
  users: {
    all: listUsers,
    create: createUser,
  },

  masterData: {
    customers: {
      all: getCustomers,
    },
  },
};
