import {create} from 'zustand';

type LoadingStore = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  setIsLoading(loading): void {
    set({isLoading: loading});
  },
}));
