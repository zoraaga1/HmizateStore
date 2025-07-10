import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState: InitialState = {
  value: {
    _id: "",
    title: "",
    price: 0,
    description: "",
    category: "",
    imgs: [],
    region: "",
    stock: 0,
    reviews: 0,
    discountedPrice: 0,
    createdBy: { 
      _id: "string",
      name: "string",
      email: "string",
      rating: 0,
    }

  }
};

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (state, action: PayloadAction<Partial<Product>>) => {
      state.value = {
        ...state.value,
        ...action.payload,
      };
    },
    resetQuickView: () => initialState,
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;