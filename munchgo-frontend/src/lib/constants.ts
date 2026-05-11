export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '已接单', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: '制作中', color: 'bg-purple-100 text-purple-800' },
  READY: { label: '待配送', color: 'bg-orange-100 text-orange-800' },
  DELIVERING: { label: '配送中', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
};

export const USER_ROLE_MAP: Record<string, string> = {
  CUSTOMER: '顾客',
  MERCHANT: '商家',
  RIDER: '骑手',
  ADMIN: '管理员',
};

export const RESTAURANT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  OPEN: { label: '营业中', color: 'bg-green-100 text-green-800' },
  CLOSED: { label: '已打烊', color: 'bg-gray-100 text-gray-800' },
  SUSPENDED: { label: '已停业', color: 'bg-red-100 text-red-800' },
};
