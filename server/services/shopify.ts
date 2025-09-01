import { GraphQLClient } from 'graphql-request';

interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
}

interface CreateCustomerInput {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
}

class ShopifyService {
  private client: GraphQLClient;
  private storeUrl: string;
  private accessToken: string;

  constructor() {
    this.storeUrl = process.env.SHOPIFY_STORE_DOMAIN || '';
    this.accessToken = process.env.SHOPIFY_API_SECRET || '';

    console.log('🔍 Shopify environment check:', {
      SHOPIFY_STORE_DOMAIN: !!process.env.SHOPIFY_STORE_DOMAIN,
      SHOPIFY_API_SECRET: !!process.env.SHOPIFY_API_SECRET,
      storeUrlValue: process.env.SHOPIFY_STORE_DOMAIN || 'MISSING',
      tokenPrefix: process.env.SHOPIFY_API_SECRET?.substring(0, 8) || 'MISSING'
    });

    if (!this.storeUrl || !this.accessToken) {
      console.error('⚠️ Shopify credentials missing:', {
        hasStoreUrl: !!this.storeUrl,
        hasAccessToken: !!this.accessToken,
        storeUrl: this.storeUrl || 'MISSING',
        tokenPrefix: this.accessToken?.substring(0, 8) || 'MISSING'
      });
      // Non lanciare errore per permettere al servizio di continuare
      // throw new Error('Missing Shopify credentials');
    }

    // Costruisce l'URL completo per l'API GraphQL
    const apiUrl = `https://${this.storeUrl}/admin/api/2025-01/graphql.json`;
    
    this.client = new GraphQLClient(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    });

    console.log('🛍️ Shopify service initialized for store:', this.storeUrl);
  }

  /**
   * Trova un cliente esistente per email
   */
  async findCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
    const query = `
      query FindCustomerByEmail($email: String!) {
        customers(first: 1, query: $email) {
          nodes {
            id
            email
            firstName
            lastName
            tags
          }
        }
      }
    `;

    try {
      const data: any = await this.client.request(query, { email });
      const customers = data.customers?.nodes || [];
      
      if (customers.length > 0) {
        console.log('👤 Customer found in Shopify:', email);
        return customers[0];
      }
      
      console.log('❌ Customer not found in Shopify:', email);
      return null;
    } catch (error) {
      console.error('❌ Error finding customer in Shopify:', error);
      throw error;
    }
  }

  /**
   * Crea un nuovo cliente in Shopify
   */
  async createCustomer(customerData: CreateCustomerInput): Promise<ShopifyCustomer> {
    const mutation = `
      mutation CreateCustomer($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const input = {
      email: customerData.email,
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      tags: customerData.tags || [],
    };

    try {
      const data: any = await this.client.request(mutation, { input });
      
      if (data.customerCreate.userErrors?.length > 0) {
        console.error('❌ Shopify customer creation errors:', data.customerCreate.userErrors);
        throw new Error(`Shopify customer creation failed: ${data.customerCreate.userErrors[0].message}`);
      }

      console.log('✅ Customer created in Shopify:', customerData.email);
      return data.customerCreate.customer;
    } catch (error) {
      console.error('❌ Error creating customer in Shopify:', error);
      throw error;
    }
  }

  /**
   * Aggiunge tag a un cliente esistente
   */
  async addTagsToCustomer(customerId: string, tags: string[]): Promise<boolean> {
    const mutation = `
      mutation AddCustomerTags($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node {
            id
            ... on Customer {
              tags
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const data: any = await this.client.request(mutation, { 
        id: customerId, 
        tags 
      });
      
      if (data.tagsAdd.userErrors?.length > 0) {
        console.error('❌ Shopify tag addition errors:', data.tagsAdd.userErrors);
        return false;
      }

      console.log(`✅ Tags added to customer ${customerId}:`, tags);
      return true;
    } catch (error) {
      console.error('❌ Error adding tags to customer in Shopify:', error);
      return false;
    }
  }

  /**
   * Trova o crea un cliente e aggiunge il tag "freetrial-lamiagazzella"
   */
  async tagCustomerAsFreeTrial(email: string, firstName?: string, lastName?: string): Promise<boolean> {
    try {
      console.log('🏷️ Tagging customer as free trial:', email);
      
      // Prova a trovare il cliente esistente
      let customer = await this.findCustomerByEmail(email);
      
      // Se non esiste, crealo
      if (!customer) {
        customer = await this.createCustomer({
          email,
          firstName,
          lastName,
          tags: ['freetrial-lamiagazzella']
        });
        return true; // Tag già aggiunto durante la creazione
      }
      
      // Se esiste, aggiungi il tag se non ce l'ha già
      if (!customer.tags.includes('freetrial-lamiagazzella')) {
        return await this.addTagsToCustomer(customer.id, ['freetrial-lamiagazzella']);
      }
      
      console.log('ℹ️ Customer already has free trial tag:', email);
      return true;
    } catch (error) {
      console.error('❌ Error tagging customer as free trial:', error);
      return false;
    }
  }

  /**
   * Trova un cliente e aggiunge il tag "Abbonamento-pagato" 
   */
  async tagCustomerAsPaid(email: string): Promise<boolean> {
    try {
      console.log('💰 Tagging customer as paid subscriber:', email);
      
      // Trova il cliente esistente
      const customer = await this.findCustomerByEmail(email);
      
      if (!customer) {
        console.log('❌ Customer not found in Shopify for paid tagging:', email);
        return false;
      }
      
      // Aggiungi il tag se non ce l'ha già
      if (!customer.tags.includes('Abbonamento-pagato')) {
        const success = await this.addTagsToCustomer(customer.id, ['Abbonamento-pagato']);
        if (success) {
          console.log('✅ Customer tagged as paid subscriber:', email);
        }
        return success;
      }
      
      console.log('ℹ️ Customer already has paid subscription tag:', email);
      return true;
    } catch (error) {
      console.error('❌ Error tagging customer as paid subscriber:', error);
      return false;
    }
  }

  /**
   * Test di connessione per verificare che l'API funzioni
   */
  async testConnection(): Promise<boolean> {
    const query = `
      query TestConnection {
        shop {
          name
          email
        }
      }
    `;

    try {
      const data: any = await this.client.request(query);
      console.log('✅ Shopify connection test successful:', data.shop.name);
      return true;
    } catch (error) {
      console.error('❌ Shopify connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
let shopifyService: ShopifyService | null = null;

export const getShopifyService = (): ShopifyService => {
  if (!shopifyService) {
    try {
      shopifyService = new ShopifyService();
    } catch (error) {
      console.error('❌ Failed to initialize Shopify service:', error);
      // Ritorna un servizio mock che non fa nulla per evitare errori
      return {
        findCustomerByEmail: async () => null,
        createCustomer: async () => ({ id: 'mock', email: '', firstName: '', lastName: '', tags: [] }),
        addTagsToCustomer: async () => false,
        tagCustomerAsFreeTrial: async () => {
          console.log('🔧 Shopify service not configured - skipping tagging');
          return false;
        },
        tagCustomerAsPaid: async () => {
          console.log('🔧 Shopify service not configured - skipping paid tagging');
          return false;
        },
        testConnection: async () => false
      } as any;
    }
  }
  return shopifyService;
};

export { ShopifyService };
export type { ShopifyCustomer, CreateCustomerInput };