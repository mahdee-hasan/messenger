import { create } from "zustand";
const useUserStore = create((set) => ({
  userId: "",
  setUserId: (value) => set({ userId: value }),
}));

export default useUserStore;
