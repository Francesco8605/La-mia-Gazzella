import '@shopify/shopify-api/adapters/node';
import { shopifyApi, Session, ApiVersion } from '@shopify/shopify-api';

interface ShopifyCustomerData {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string;
  ordersCount: number;
}

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || '';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

if (!SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
  console.warn('⚠️ Shopify credentials not configured. Customer auto-fill will be disabled.');
}

const shopify = SHOPIFY_STORE_URL && SHOPIFY_ACCESS_TOKEN ? shopifyApi({
  apiSecretKey: SHOPIFY_ACCESS_TOKEN,
  apiVersion: ApiVersion.January24,
  isCustomStoreApp: true,
  adminApiAccessToken: SHOPIFY_ACCESS_TOKEN,
  isEmbeddedApp: false,
  hostName: SHOPIFY_STORE_URL.replace('https://', '').replace('http://', ''),
}) : null;

/**
 * Search for customer data in Shopify by email
 */
export async function getCustomerDataFromShopify(email: string): Promise<ShopifyCustomerData | null> {
  if (!shopify || !SHOPIFY_STORE_URL || !SHOPIFY_ACCESS_TOKEN) {
    console.warn('Shopify not configured, skipping customer lookup');
    return null;
  }

  try {
    // Create a session for the API call
    const session = new Session({
      id: 'offline-session',
      shop: SHOPIFY_STORE_URL.replace('https://', '').replace('http://', ''),
      state: 'offline',
      isOnline: false,
      accessToken: SHOPIFY_ACCESS_TOKEN,
    });

    // Use GraphQL to search for customer by email
    const client = new shopify.clients.Graphql({ session });
    
    const query = `
      query getCustomerByEmail($email: String!) {
        customers(first: 1, query: $email) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              ordersCount
            }
          }
        }
      }
    `;

    const response = await client.query({
      data: {
        query,
        variables: {
          email: `email:${email}`,
        },
      },
    });

    const data = response.body as any;
    const customers = data?.data?.customers?.edges || [];

    if (customers.length === 0) {
      console.log(`No Shopify customer found for email: ${email}`);
      return null;
    }

    const customer = customers[0].node;
    
    return {
      firstName: customer.firstName || null,
      lastName: customer.lastName || null,
      phone: customer.phone || null,
      email: customer.email,
      ordersCount: customer.ordersCount || 0,
    };
  } catch (error) {
    console.error('Error fetching customer from Shopify:', error);
    return null;
  }
}

/**
 * Verify if customer has purchased from Shopify
 */
export async function hasShopifyPurchase(email: string): Promise<boolean> {
  const customerData = await getCustomerDataFromShopify(email);
  return customerData !== null && customerData.ordersCount > 0;
}
