import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/components/axiosInstance'; // Adjust path as needed

// Async thunks for API calls
export const fetchMenus = createAsyncThunk(
  'menus/fetchMenus',
  async (menuId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`Menus/all/${menuId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menus');
    }
  }
);

export const createMenu = createAsyncThunk(
  'menus/createMenu',
  async ({ menuData, menuId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.post(`Menus/create/${menuId}`, menuData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create menu');
    }
  }
);

export const updateMenu = createAsyncThunk(
  'menus/updateMenu',
  async ({ menuData, menuId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.put(`Menus/update/${menuData.id}/${menuId}`, menuData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu');
    }
  }
);

export const deleteMenu = createAsyncThunk(
  'menus/deleteMenu',
  async ({ id, menuId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      await api.delete(`Menus/${id}/${menuId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu');
    }
  }
);

export const fetchRoles = createAsyncThunk(
  'menus/fetchRoles',
  async (menuId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`Roles/${menuId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
    }
  }
);

const initialState = {
  menus: [],
  availableRoles: [],
  loading: false,
  rolesLoading: false,
  error: null,
  success: null,
  operationType: null, // 'create', 'update', 'delete'
};

const menuSlice = createSlice({
  name: 'menus',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.error = null;
      state.success = null;
      state.operationType = null;
    },
    clearMenus: (state) => {
      state.menus = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Menus
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = Array.isArray(action.payload) 
          ? action.payload.sort((a, b) => a.order - b.order)
          : [];
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Menu
      .addCase(createMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationType = 'create';
      })
      .addCase(createMenu.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Menu created successfully';
        state.operationType = 'create';
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operationType = 'create';
      })
      
      // Update Menu
      .addCase(updateMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationType = 'update';
      })
      .addCase(updateMenu.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Menu updated successfully';
        state.operationType = 'update';
      })
      .addCase(updateMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operationType = 'update';
      })
      
      // Delete Menu
      .addCase(deleteMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operationType = 'delete';
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Menu deleted successfully';
        state.operationType = 'delete';
        state.menus = state.menus.filter(menu => menu.id !== action.payload);
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operationType = 'delete';
      })
      
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.rolesLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesLoading = false;
        if (Array.isArray(action.payload)) {
          state.availableRoles = action.payload.map(role => 
            role.name || role.roleName || role.title || role
          );
        } else {
          state.availableRoles = [];
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesLoading = false;
        state.error = action.payload;
        state.availableRoles = [];
      });
  },
});

export const { resetStatus, clearMenus } = menuSlice.actions;
export default menuSlice.reducer;