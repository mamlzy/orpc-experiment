import { request } from '@/lib/axios';

const create = async (payload: any) => {
  const response = await request({
    url: '/master-data/customer',
    method: 'POST',
    data: payload,
  });
  return response;
};

const getAll = async (page = 1, limit = 5, search?: string) => {
  const response = await request({
    url: '/master-data/customer',
    method: 'GET',
    params: { page, limit, search },
  });
  return response;
};

const getById = async (id: string) => {
  const response = await request({
    url: `/master-data/customer/${id}`,
    method: 'GET',
  });
  return response;
};

const update = async (id: string, payload: any) => {
  const response = await request({
    url: `/master-data/customer/${id}`,
    method: 'PUT',
    data: payload,
  });
  return response;
};

const deleteById = async (id: string) => {
  const response = await request({
    url: `/master-data/customer/${id}`,
    method: 'DELETE',
  });
  return response;
};

export const customerRequest = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
