import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import cartReducer from './cartSlice';
import ordersReducer from './ordersSlice';
import favoritesReducer from './favoritesSlice';
import searchReducer from './searchSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    favorites: favoritesReducer,
    search: searchReducer,
  },
});