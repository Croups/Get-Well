import { create } from 'zustand'
import { IUser } from '../types';

interface IUserStore {
    user: IUser | undefined;
    setUser: (user: IUser | undefined) => void
}

const useUserStore= create<IUserStore>((set, get)=>({
    user: undefined,
    setUser: (user) => set({user: user})
}));


export default useUserStore;