import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrder, getOrders, updateOrderStatus } from '../services/api';

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData) => {
    const result = await createOrder(orderData);
    return result;
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const result = await getOrders();
    return result;
  }
);

export const changeOrderStatus = createAsyncThunk(
  'orders/changeStatus',
  async ({ id, status }) => {
    const result = await updateOrderStatus(id, status);
    return { id, status, result };
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // placeOrder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.currentOrder = action.payload.data;
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.items = Array.isArray(action.payload.data) ? action.payload.data : 
                       Array.isArray(action.payload) ? action.payload : [];
        } else {
          state.error = action.payload.error;
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // changeOrderStatus
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        const { id, status, result } = action.payload;
        if (result.success) {
          const order = state.items.find(o => o.id === id);
          if (order) order.status = status;
        }
      });
  },
});

export const { clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;