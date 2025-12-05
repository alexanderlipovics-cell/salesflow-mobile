import { CUSTOMER_LIFECYCLE, FollowUpTask } from '../constants/followUpConfig';

export const getUpcomingTask = (customerStartDate: string): FollowUpTask | null => {
  const start = new Date(customerStartDate);
  const today = new Date();
  const diffDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  return CUSTOMER_LIFECYCLE.find(task => task.dayOffset >= diffDays) || null;
};

export const getDaysSinceStart = (startDate: string): number => {
  const start = new Date(startDate);
  const today = new Date();
  return Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

