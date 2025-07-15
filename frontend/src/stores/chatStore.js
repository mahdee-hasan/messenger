import { create } from "zustand";

const useChatStore = create((set) => ({
  isOpenGlobal: false,
  setIsOpenGlobal: (value) => set({ isOpenGlobal: value }),
  popUpMessage: null,
  setPopUpMessage: (value) => set({ popUpMessage: value }),
}));

export default useChatStore;
