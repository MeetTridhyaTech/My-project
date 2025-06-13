import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/components/axiosInstance';

export const fetchRoles = createAsyncThunk(
    'roles/fetchRoles',
    async(menuId, thunkAPI) => {
        try{
        // const token= localStorage.getItem('token');
        const response = await api.get(`Roles/${menuId}`,{
            // headers: {Authorization: `Bearer ${token}`},
        });
        return response.data;
        }
        catch(error)
        {
        return thunkAPI.rejectWithValue(error.response?.data ||'Failed to fetch roles');
        }
    }
);

// Async thunk for creating a role
export const createRole = createAsyncThunk(
  'roles/createRole',
  async ({ role, menuId }, thunkAPI) => {
    try {
      await api.post(`Roles/${menuId}`, role); // Fixed axios -> api
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Error creating role');
    }
  }
);

export const editRole = createAsyncThunk(
  'roles/editRole',
  async ({ role, roleId, menuId }, thunkAPI) => {
    try {
      await api.put(`Roles/${roleId}/${menuId}`, role);
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to edit role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async ({ roleId, menuId }, thunkAPI) => {
    try {
      await api.delete(`Roles/${roleId}/${menuId}`);
      return roleId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to delete role');
    }
  }
);

// Slice
const roleSlice = createSlice({
  name: 'roles',
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
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Edit Role
      .addCase(editRole.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(editRole.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(editRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //fetch role
        .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.list = state.list.filter((role) => role.roleID !== action.payload);
      });     
  },
});

// Exports
export const { resetStatus } = roleSlice.actions;
export default roleSlice.reducer;
