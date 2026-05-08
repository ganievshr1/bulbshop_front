import { createSlice } from '@reduxjs/toolkit';

const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: loadFavorites(),
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex(item => item.id === product.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
      saveFavorites(state.items);
    },
    removeFromFavorites: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveFavorites(state.items);
    },
  },
});

export const { toggleFavorite, removeFromFavorites } = favoritesSlice.actions;

export const selectFavorites = (state) => state.favorites.items;
export const selectFavoritesCount = (state) => state.favorites.items.length;
export const selectIsFavorite = (productId) => (state) => 
  state.favorites.items.some(item => item.id === productId);

export default favoritesSlice.reducer;