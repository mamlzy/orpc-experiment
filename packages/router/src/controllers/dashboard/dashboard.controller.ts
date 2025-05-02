import type { Context } from 'hono';

import { errorResponse, successResponse } from '../../helpers/response';
import * as service from '../../services/dashboard/dashboard.service';

export const getTotalCustomer = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getTotalCustomer(query);
    return ctx.json(successResponse(result, 'Success get total customer'));
  } catch (error) {
    return ctx.json(errorResponse(error, 'Failed to get total customer'), 500);
  }
};

export const getTotalRevenue = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getTotalRevenue(query);
    return ctx.json(successResponse(result, 'Success get total revenue'));
  } catch (error) {
    return ctx.json(errorResponse(error, 'Failed to get total revenue'), 500);
  }
};

export const getTotalCustomerByCountry = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getTotalCustomerByCountry(query);
    return ctx.json(
      successResponse(result, 'Success get total customer by country')
    );
  } catch (error) {
    return ctx.json(
      errorResponse(error, 'Failed to get total customer by country'),
      500
    );
  }
};

export const getRecentClosing = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getRecentClosing(query);
    return ctx.json(
      successResponse(result, 'Success get total recent closing')
    );
  } catch (error) {
    return ctx.json(errorResponse(error, 'Failed to get recent closing'), 500);
  }
};

export const getTotalCustomerBySector = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getTotalCustomerBySector(query);
    return ctx.json(
      successResponse(result, 'Success get total customer by sector')
    );
  } catch (error) {
    return ctx.json(
      errorResponse(error, 'Failed to get total customer by sector'),
      500
    );
  }
};

export const getTotalPicCustomer = async (ctx: Context) => {
  try {
    const query = ctx.req.query();
    const result = await service.getTotalPicCustomer(query);
    return ctx.json(successResponse(result, 'Success get total pic customer'));
  } catch (error) {
    return ctx.json(
      errorResponse(error, 'Failed to get total pic customer'),
      500
    );
  }
};
