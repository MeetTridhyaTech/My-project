// src/features/assignPermissions/assignPermissionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/components/axiosInstance';

// Async thunk to fetch roles
export const fetchRoles = createAsyncThunk(
  'assignPermissions/fetchRoles',
  async (menuId, thunkAPI) => {
    try {
      const response = await api.get(`Roles/${menuId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch roles'
      );
    }
  }
);

// Async thunk to fetch menus
export const fetchMenus = createAsyncThunk(
  'assignPermissions/fetchMenus',
  async (menuId, thunkAPI) => {
    try {
      const response = await api.get(`Menus/all/${menuId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch menus'
      );
    }
  }
);

// Async thunk to fetch permissions
export const fetchPermissions = createAsyncThunk(
  'assignPermissions/fetchPermissions',
  async (menuId, thunkAPI) => {
    try {
      const response = await api.get(`Permissions/All/${menuId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch permissions'
      );
    }
  }
);

// Async thunk to assign permissions
export const assignRoleMenuPermission = createAsyncThunk(
  'assignPermissions/assignRoleMenuPermission',
  async ({ roleId, menuId, permissionIds }, thunkAPI) => {
    try {
      const response = await api.post('Permissions/assign', {
        roleId,
        menuId,
        permissionIds,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to assign permissions'
      );
    }
  }
);

// Initial state
const initialState = {
  roles: [],
  menus: [],
  permissions: [],
  loading: {
    roles: false,
    menus: false,
    permissions: false,
    assigning: false,
  },
  error: null,
  successMessage: null,
};

const assignPermissionSlice = createSlice({
  name: 'assignPermissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearPermissions: (state) => {
      state.permissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading.roles = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading.roles = false;
        state.roles = action.payload || [];
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading.roles = false;
        state.error = action.payload;
      })
      
      // Fetch Menus
      .addCase(fetchMenus.pending, (state) => {
        state.loading.menus = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading.menus = false;
        state.menus = action.payload || [];
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading.menus = false;
        state.error = action.payload;
      })
      
      // Fetch Permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading.permissions = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading.permissions = false;
        state.permissions = action.payload || [];
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading.permissions = false;
        state.error = action.payload;
      })
      
      // Assign Role Menu Permission
      .addCase(assignRoleMenuPermission.pending, (state) => {
        state.loading.assigning = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(assignRoleMenuPermission.fulfilled, (state, action) => {
        state.loading.assigning = false;
        state.successMessage = 'Permissions assigned successfully';
      })
      .addCase(assignRoleMenuPermission.rejected, (state, action) => {
        state.loading.assigning = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearPermissions } = assignPermissionSlice.actions;

export default assignPermissionSlice.reducer;