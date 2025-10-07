import { create } from "zustand";

const openCloseStore = create((set) => ({
  dealerModal: false,
  supplierModal: false,
  categoryModal: false,

  setDealerModal: (val) => {
    set({ dealerModal: val });
  },
  setSupplierModal: (val) => {
    set({ supplierModal: val });
  },
  setCategoryModal: (val) => {
    set({ categoryModal: val });
  },
}));

export default openCloseStore;
