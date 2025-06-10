import * as invoiceController from './controllers/ar/invoice.controller';
import * as paymentController from './controllers/ar/payment.controller';
import * as dashboardController from './controllers/dashboard/dashboard.controller';
import * as companyController from './controllers/master-data/company.controller';
import * as customerPicController from './controllers/master-data/customer-pic.controller';
import * as customerProductController from './controllers/master-data/customer-product.controller';
import * as customerController from './controllers/master-data/customer.controller';
import * as productController from './controllers/master-data/product.controller';
import * as serviceController from './controllers/master-data/service.controller';
import * as userController from './controllers/master-data/user.controller';
import * as transactionController from './controllers/sales/transaction.controller';
import * as bankAccountController from './controllers/setting/bank-account.controller';

export const router = {
  masterData: {
    user: {
      getAll: userController.getUsers,
      getById: userController.getUser,
      updateById: userController.updateUser,
      deleteById: userController.deleteUser,
    },
    dashboard: {
      totalCustomer: dashboardController.getTotalCustomer,
      totalRevenue: dashboardController.getTotalRevenue,
      totalCustomerByCountry: dashboardController.getTotalCustomerByCountry,
      totalPicCustomer: dashboardController.getTotalPicCustomer,
      totalCustomerBySector: dashboardController.getTotalCustomerBySector,
    },
    customer: {
      checkSimilarity: customerController.checkSimilarityInput,
      create: customerController.create,
      createMany: customerController.createCustomers,
      getAll: customerController.getCustomers,
      getById: customerController.getCustomer,
      updateById: customerController.updateById,
      deleteById: customerController.deleteById,
    },
    customerPic: {
      getAll: customerPicController.getCustomerPics,
      create: customerPicController.create,
      updateById: customerPicController.updateCustomerPic,
      deleteById: customerPicController.deleteCustomerPic,
    },
    customerProduct: {
      create: customerProductController.createCustomerProduct,
      createMany: customerProductController.createCustomerProducts,
      getAll: customerProductController.getCustomerProducts,
      getById: customerProductController.getCustomerProduct,
      manage: customerProductController.manageCustomerProducts,
    },
    product: {
      create: productController.createProduct,
      createMany: productController.createProducts,
      getAll: productController.getProducts,
      getById: productController.getProduct,
      updateById: productController.updateProductById,
      deleteById: productController.deleteProductById,
    },
    company: {
      getAll: companyController.getCompanies,
      getById: companyController.getCompany,
    },
    service: {
      create: serviceController.createService,
      createMany: serviceController.createServices,
      getAll: serviceController.getServices,
      getById: serviceController.getService,
      updateById: serviceController.updateService,
      deleteById: serviceController.deleteService,
    },
  },
  sales: {
    transaction: {
      create: transactionController.createTransaction,
      createMany: transactionController.createTransactions,
      getAll: transactionController.getTransactions,
      getById: transactionController.getTransaction,
      updateById: transactionController.updateTransaction,
      deleteById: transactionController.deleteTransaction,
      deleteAll: transactionController.deleteAllTransactions,
      getTransactionForInvoice: transactionController.getTransactionForInvoice,
      getTransactionInvoiceSummary:
        transactionController.getTransactionInvoiceSummary,
    },
  },
  ar: {
    invoice: {
      create: invoiceController.createInvoice,
      createMany: invoiceController.createInvoices,
      getAll: invoiceController.getInvoices,
      getById: invoiceController.getInvoice,
      updateById: invoiceController.updateInvoice,
      deleteById: invoiceController.deleteInvoice,
      deleteAll: invoiceController.deleteAllInvoices,
    },
    payment: {
      create: paymentController.createPayment,
      createMany: paymentController.createPayments,
      getAll: paymentController.getPayments,
      getById: paymentController.getPayment,
      updateById: paymentController.updatePayment,
      deleteById: paymentController.deletePayment,
      deleteAll: paymentController.deleteAllPayments,
    },
  },
  setting: {
    bankAccount: {
      create: bankAccountController.createBankAccount,
      getAll: bankAccountController.getBankAccounts,
      getById: bankAccountController.getBankAccount,
      updateById: bankAccountController.updateBankAccount,
      deleteById: bankAccountController.deleteBankAccount,
      deleteAll: bankAccountController.deleteAllBankAccounts,
    },
  },
};
