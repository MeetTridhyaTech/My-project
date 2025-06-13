// src/features/permissions/permissionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/components/axiosInstance';

export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async (menuId, thunkAPI) => {
    try {
      const response = await api.get(`Permissions/All/${menuId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const addPermission = createAsyncThunk(
  'permissions/addPermission',
  async ({ name, menuId }, thunkAPI) => {
    try {
      await api.post(`Permissions/Add/${menuId}`, { name });
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to add permission');
    }
  }
);

// Delete permission
export const deletePermission = createAsyncThunk(
  'permissions/deletePermission',
  async ({ id, menuId }, thunkAPI) => {
    try {
      await api.delete(`Permissions/${id}/${menuId}`);
      return id; // Return the deleted ID to update the state
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to delete permission');
    }
  }
);

// //Role Menu Permission
// export const fetchRolePermissions = createAsyncThunk(
//   'rolePermissions/fetchRolePermissions',
//   async(menuId, thunkAPI) => {
//     try{
//       const response= await api.get(`Permissions/roles-with-permissions/${menuId}`);
//       return response.data;
//     }catch (error){
//       return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch role menu permissions");
//     }
//   }
// );

const permissionSlice = createSlice({
  name: 'permissions',
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPermission.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addPermission.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(addPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
            .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
           // Delete permission cases
      .addCase(deletePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Remove the deleted permission from the data array
        state.data = state.data.filter(permission => permission.id !== action.payload);
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStatus } = permissionSlice.actions;
export default permissionSlice.reducer;
