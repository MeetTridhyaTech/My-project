// src/features/rolePermissions/rolePermissionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/components/axiosInstance';

// Thunk to fetch roles with permissions
export const fetchRolePermissions = createAsyncThunk(
  'rolePermissions/fetchRolePermissions',
  async (menuId, thunkAPI) => {
    try {
      const response = await api.get(`Permissions/roles-with-permissions/${menuId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch role permissions');
    }
  }
);

// Assign permissions to a role for a menu
export const assignRoleMenuPermission = createAsyncThunk(
  'roleMenuPermissions/assign',
  async ({ roleId, menuId, permissionIds }, thunkAPI) => {
    try {
      const response = await api.post(`Permissions/assign`, {
        roleId,
        menuId,
        permissionIds,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to assign permissions');
    }
  }
);


const rolePermissionSlice = createSlice({
  name: 'rolePermissions',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
            // ASSIGN
      .addCase(assignRoleMenuPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignRoleMenuPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Permissions assigned successfully';
      })
      .addCase(assignRoleMenuPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default rolePermissionSlice.reducer;
