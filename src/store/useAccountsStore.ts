/**
 * Zustand Store for Kwarta Accounts & Cards
 */

import { create } from 'zustand';
import { AccountCard, CreateAccountCardInput } from '@/types/accounts';
import {
  getAllAccountCards,
  insertAccountCard,
  updateAccountCard,
  deleteAccountCard,
} from '@/database/accounts';

interface AccountsState {
  cards: AccountCard[];
  isLoadingCards: boolean;
  loadCards: () => Promise<void>;
  addCard: (input: CreateAccountCardInput) => Promise<AccountCard>;
  updateCardDetails: (id: string, updates: Partial<CreateAccountCardInput>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  cards: [],
  isLoadingCards: false,

  loadCards: async () => {
    try {
      set({ isLoadingCards: true });
      const cards = await getAllAccountCards();
      set({ cards, isLoadingCards: false });
    } catch (error) {
      console.warn('[Kwarta Accounts] Failed to load cards:', error);
      set({ isLoadingCards: false });
    }
  },

  addCard: async (input: CreateAccountCardInput) => {
    const newCard = await insertAccountCard(input);
    await get().loadCards();
    return newCard;
  },

  updateCardDetails: async (id: string, updates: Partial<CreateAccountCardInput>) => {
    await updateAccountCard(id, updates);
    await get().loadCards();
  },

  removeCard: async (id: string) => {
    await deleteAccountCard(id);
    await get().loadCards();
  },
}));

export default useAccountsStore;
