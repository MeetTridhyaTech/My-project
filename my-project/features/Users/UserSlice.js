// src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/components/axiosInstance';

const menuId = '17DEC13F-8C9F-4287-A918-774375AC1B76';

// Existing thunks
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`User/${id}/${menuId}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Failed to fetch user.');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        roleID: formData.roleName?.value
      };
      await api.post(`User/AddOrUpdate/${menuId}?id=${id}`, payload);
      return 'User updated successfully';
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user.');
    }
  }
);

// New thunk for adding user
export const addUser = createAsyncThunk(
  'user/addUser',
  async (formData, { rejectWithValue }) => {
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        roleID: formData.roleID
      };
      await api.post(`User/AddOrUpdate/${menuId}`, payload);
      return 'User added successfully';
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add user.');
    }
  }
);

// New thunk for fetching roles
export const fetchRoles = createAsyncThunk(
  'user/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`Roles/${menuId}`);
      const roleOptions = response.data.map((role) => ({
        value: role.roleID,
        label: role.roleName, 
      }));
      return roleOptions;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch roles.');
    }
  }
);

// Existing thunks for ListUser component
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post(`User/search/${menuId}`, params);
      if (response.data && Array.isArray(response.data.data)) {
        return {
          users: response.data.data,
          totalRecords: response.data.totalRecords || 0,
          totalPages: response.data.totalPages || 1
        };
      } else {
        throw new Error("Invalid API response format.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        return {
          users: [],
          totalRecords: 0,
          totalPages: 1
        };
      }
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users.');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/user/${id}/${menuId}`);
      return { id, message: 'User deleted successfully' };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user.');
    }
  }
);

export const mimicUser = createAsyncThunk(
  'user/mimicUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`user/mimic/${id}/${menuId}`);
      const data = response.data.data;

      if (!data || !data.token) {
        throw new Error("No token received.");
      }

      return {
        token: data.token,
        roleName: data.roleName,
        roleID: data.roleID,
        permissions: data.permissions,
        message: 'Mimic successful! Reloading as mimicked user...'
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mimic user.');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    // Single user state (for EditUser)
    user: null,
    loading: false,
    error: '',
    successMessage: '',
    
    // Roles state
    roles: [],
    rolesLoading: false,
    rolesError: '',
    
    // Users list state (for ListUser)
    users: [],
    usersLoading: false,
    usersError: '',
    totalRecords: 0,
    totalPages: 1,
    
    // UI state
    currentPage: 1,
    pageSize: 5,
    sortBy: 'FirstName',
    sortOrder: 'asc',
    searchTerm: '',
    filters: []
  },
  reducers: {
    clearMessages: (state) => {
      state.error = '';
      state.successMessage = '';
      state.usersError = '';
      state.rolesError = '';
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    addFilter: (state, action) => {
      const { columnName, condition, value } = action.payload;
      const existingFilterIndex = state.filters.findIndex(
        (f) => f.columnName === columnName
      );

      if (existingFilterIndex >= 0) {
        // Update existing filter
        state.filters[existingFilterIndex] = { columnName, condition, value };
      } else {
        // Add new filter
        state.filters.push({ columnName, condition, value });
      }
      state.currentPage = 1;
    },
    removeFilter: (state, action) => {
      state.filters = state.filters.filter(
        (f) => f.columnName !== action.payload
      );
      state.currentPage = 1;
    },
    clearAllFilters: (state) => {
      state.filters = [];
      state.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Existing cases for single user operations
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add user cases
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch roles cases
      .addCase(fetchRoles.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError = '';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload;
      })
      
      // Existing cases for users list operations
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = '';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.totalRecords = action.payload.totalRecords;
        state.totalPages = action.payload.totalPages;
        
        // If no users found and not on first page, reset to first page
        if (action.payload.users.length === 0 && state.currentPage > 1) {
          state.currentPage = 1;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      
      .addCase(deleteUser.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload.id);
        state.successMessage = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      
      .addCase(mimicUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(mimicUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(mimicUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearMessages, 
  setCurrentPage, 
  setPageSize, 
  setSortBy, 
  setSortOrder, 
  setSearchTerm, 
  setFilters,
  addFilter,
  removeFilter,
  clearAllFilters
} = userSlice.actions;

export default userSlice.reducer;