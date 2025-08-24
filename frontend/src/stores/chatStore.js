import { create } from "zustand";

const useChatStore = create((set) => ({
  isOpenGlobal: false,
  setIsOpenGlobal: (value) => set({ isOpenGlobal: value }),
  popUpMessage: null,
  setPopUpMessage: (value) => set({ popUpMessage: value }),
  notification: null,
  setNotification: (value) => set({ notification: value }),
  unseenNotification: null,
  setUnseenNotification: (value) => set({ unseenNotification: value }),
  unseenMsg: null,
  setUnseenMsg: (value) => set({ unseenMsg: value }),
}));

export default useChatStore;
