import { SubscriptionStatus } from '../generated/prisma';

export const STRIPE_PRICE_IDS = {
  BASE: {
    MONTHLY: 'price_1SEmSa05AUDEDgY6wkvwSVsX',
    QUARTERLY: 'price_1SEmTH05AUDEDgY6dzBqZZk3',
    HALFYEAR: 'price_1SEmTo05AUDEDgY6sH8LUEOY',
    YEARLY: 'price_1SEmUO05AUDEDgY6TiucbNRo',
  },
  PRO: {
    MONTHLY: 'price_1SEmVC05AUDEDgY6xIRiY1M1',
    QUARTERLY: 'price_1SEmWp05AUDEDgY6apP6VY39',
    HALFYEAR: 'price_1SEmXZ05AUDEDgY69XM7EHoj',
    YEARLY: 'price_1SEmYu05AUDEDgY6NGcX3Md3',
  },
  ENTERPRISE: {
    MONTHLY: 'price_1SEmZM05AUDEDgY64cFquGZQ',
    QUARTERLY: 'price_1SEmaD05AUDEDgY6DbsyaBxu',
    HALFYEAR: 'price_1SEmay05AUDEDgY67WDQVzqW',
    YEARLY: 'price_1SEmbn05AUDEDgY6fS6I4FT7',
  },
};

export const mapStripeStatusToInternal = (
  stripeStatus: string
): SubscriptionStatus => {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
      return SubscriptionStatus.CANCELLED;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    default:
      return SubscriptionStatus.PAST_DUE;
  }
};
