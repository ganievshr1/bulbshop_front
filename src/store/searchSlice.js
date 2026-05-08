import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
  },
  reducers: {
    updateSearch: (state, action) => {
      state.query = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
    },
  },
});

export const { updateSearch, clearSearch } = searchSlice.actions;
export const selectSearchQuery = (state) => state.search.query;
export default searchSlice.reducer;