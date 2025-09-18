// CENTRALIZED PRICING CONSTANTS for Formula Gazzella
export const PRICING = {
  REGULAR_SUBSCRIPTION: '29.00', // Regular app subscription
  FORMULA_GAZZELLA: {
    TOTAL: '29.99', // Total monthly price for Formula Gazzella
    STRIPE_UNIT_AMOUNT: 2999, // In cents for Stripe
    PRODUCT_ID: '9890948055381', // Shopify product ID
    PRODUCT_PRICE: '20.00', // Product cost portion
    SHIPPING_PRICE: '9.99' // Shipping cost portion
  }
} as const;