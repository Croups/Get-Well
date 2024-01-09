import { create } from 'zustand'

interface ILoadingStore {
    isLoading: boolean;
    setLoading: (status: boolean) => void;
}

const useLoadingStore= create<ILoadingStore>((set)=>({
    isLoading: false,
    setLoading:(status) => set({isLoading: status})
}));


export default useLoadingStore;