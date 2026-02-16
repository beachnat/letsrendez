/**
 * Affiliate IDs for accommodation (and later flight/activity) links.
 * Set in .env; restart the dev server after changing. See docs/AFFILIATE-PROGRAMS.md.
 */
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env && process.env[key] != null) {
    return String(process.env[key]).trim() || '';
  }
  return '';
};

export const bookingAffiliateId = getEnv('EXPO_PUBLIC_BOOKING_AFFILIATE_ID');
export const vrboAffiliateId = getEnv('EXPO_PUBLIC_VRBO_AFFILIATE_ID');

/** Viator: 9-digit partner ID (pid). Optional mcid from Viator dashboard. */
export const viatorPartnerId = getEnv('EXPO_PUBLIC_VIATOR_PARTNER_ID');
export const viatorMcid = getEnv('EXPO_PUBLIC_VIATOR_MCID');
