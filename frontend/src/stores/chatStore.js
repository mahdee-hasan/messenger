import { create } from "zustand";

const useChatStore = create((set) => ({
  isOpenGlobal: false,
  setIsOpenGlobal: (value) => set({ isOpenGlobal: value }),

  popUpMessage: null,
  setPopUpMessage: (value) => set({ popUpMessage: value }),

  notification: null,
  setNotification: (value) => set({ notification: value }),

  // 🔔 Unseen Notifications
  unseenNotification: 0,
  increaseUnseenNotification: () =>
    set((state) => ({ unseenNotification: state.unseenNotification + 1 })),
  resetUnseenNotification: () => set({ unseenNotification: 0 }),
  setUnseenNotification: (value) => set({ unseenNotification: value }),
  // 💬 Unseen Messages
  unseenMsg: 0,
  increaseUnseenMsg: () => set((state) => ({ unseenMsg: state.unseenMsg + 1 })),
  resetUnseenMsg: () => set({ unseenMsg: 0 }),
  setUnseenMsg: (value) => set({ unseenMsg: value }),
}));

export default useChatStore;
