import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
  _id: string;  // Changed from number to string to match MongoDB
  title: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  status?: string;
  imgs?: string[]; // Simplified to match your Product type
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { _id } = action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => { // Changed to string
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
    updateWishlistItemQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number }>
    ) => {
      const { _id, quantity } = action.payload;
      const item = state.items.find((item) => item._id === _id);
      if (item) {
        item.quantity = quantity;
      }
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
  updateWishlistItemQuantity,
} = wishlist.actions;
export default wishlist.reducer;