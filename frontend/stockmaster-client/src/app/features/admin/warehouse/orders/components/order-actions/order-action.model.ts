export const ORDER_ACTION = {
  generateGuide: 'generateGuide',
  viewDetail: 'viewDetail',
  updateStatus: 'updateStatus',
};
export type OrderAction = (typeof ORDER_ACTION)[keyof typeof ORDER_ACTION];
