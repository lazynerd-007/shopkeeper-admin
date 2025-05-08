import api from './api';

export interface Store {
  id: string;
  name: string;
  contactEmail: string;
  businessEmail: string;
  phoneNumber: string;
}

/**
 * Service for handling store-related API operations
 */
export const storeService = {
  /**
   * Get all stores for the merchant
   */
  async getStores(): Promise<Store[]> {
    const response = await api.get<Store[]>('/stores/merchants');
    return response.data;
  },
  
  /**
   * Get store by ID
   */
  async getStoreById(storeId: string): Promise<Store> {
    const response = await api.get<Store>(`/stores/${storeId}`);
    return response.data;
  }
};

export default storeService; 