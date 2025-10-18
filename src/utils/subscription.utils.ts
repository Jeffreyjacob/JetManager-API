import { SubscriptionDuration, Plans } from '@prisma/client';

interface PlanFeatures {
  maxWorkers: number;
  maxProjects: number;
  maxTasks: number;
}

interface PlanDetails extends PlanFeatures {
  price: number;
  duration: SubscriptionDuration;
  trialDays: number;
}

const BASE_PRICES: Record<Plans, number> = {
  BASE: 10,
  ENTERPRISE: 20,
  PRO: 50,
};

const DURATION_MULTIPLIERS: Record<SubscriptionDuration, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  HALFYEAR: 6,
  YEARLY: 12,
};

const DURATION_DISCOUNTS: Partial<Record<SubscriptionDuration, number>> = {
  QUARTERLY: 0.05,
  HALFYEAR: 0.1,
  YEARLY: 0.15,
};

const TRIAL_DAYS: Record<Plans, number> = {
  BASE: 7, // 7days
  ENTERPRISE: 7, // 7 days
  PRO: 14, // 14 days
};

export const getFeaturesByPlan = (plan: Plans): PlanFeatures => {
  switch (plan) {
    case Plans.BASE:
      return { maxProjects: 5, maxWorkers: 25, maxTasks: 100 };
    case Plans.ENTERPRISE:
      return { maxProjects: 10, maxWorkers: 50, maxTasks: 500 };
    case Plans.PRO:
      return { maxProjects: 100, maxWorkers: 1000, maxTasks: 10000 };
  }
};

export const getPlanDetials = ({
  plan,
  duration,
}: {
  plan: Plans;
  duration: SubscriptionDuration;
}): PlanDetails => {
  const basePrice = BASE_PRICES[plan];
  const multipler = DURATION_MULTIPLIERS[duration];
  const discount = DURATION_DISCOUNTS[duration] ?? 0;
  const gross = basePrice * multipler;
  const netPrice = Math.round(gross * (1 - discount) * 100) / 100;
  const trialDays = TRIAL_DAYS[plan];
  const baseFeatures = getFeaturesByPlan(plan);

  return {
    maxProjects: baseFeatures.maxProjects * multipler,
    maxWorkers: baseFeatures.maxProjects * multipler,
    maxTasks: baseFeatures.maxTasks * multipler,
    price: netPrice,
    duration,
    trialDays,
  };
};
