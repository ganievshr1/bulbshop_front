import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts, getProductById, getCategories } from '../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const result = await getProducts();
    return result;
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id) => {
    const result = await getProductById(id);
    return result;
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const result = await getCategories();
    return result;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    currentProduct: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.items = action.payload.data || [];
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.currentProduct = action.payload.data;
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchCategories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.categories = action.payload.data || [];
        }
      });
  },
});

export const { clearCurrentProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;