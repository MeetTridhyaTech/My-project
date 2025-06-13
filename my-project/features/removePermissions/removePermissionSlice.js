// // src/features/removePermissions/removePermissionSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../src/components/axiosInstance';

// // Async thunk to fetch roles
// export const fetchRoles = createAsyncThunk(
//   'removePermissions/fetchRoles',
//   async (menuId, thunkAPI) => {
//     try {
//       const response = await api.get(`Roles/${menuId}`);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch roles'
//       );
//     }
//   }
// );

// // Async thunk to fetch menus
// export const fetchMenus = createAsyncThunk(
//   'removePermissions/fetchMenus',
//   async (menuId, thunkAPI) => {
//     try {
//       const response = await api.get(`Menus/all/${menuId}`);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch menus'
//       );
//     }
//   }
// );

// // Async thunk to fetch permissions
// export const fetchPermissions = createAsyncThunk(
//   'removePermissions/fetchPermissions',
//   async (menuId, thunkAPI) => {
//     try {
//       const response = await api.get(`Permissions/All/${menuId}`);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch permissions'
//       );
//     }
//   }
// );

// // Async thunk to remove permissions
// export const removeRoleMenuPermissions = createAsyncThunk(
//   'removePermissions/removeRoleMenuPermissions',
//   async ({ roleId, menuId, permissionIds, staticMenuId }, thunkAPI) => {
//     try {
//       const payload = {
//         roleId,
//         menuId,
//         permissionIds,
//       };
//       const response = await api.post(`Permissions/remove-bulk/${staticMenuId}`, payload);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to remove permissions'
//       );
//     }
//   }
// );

// // Initial state
// const initialState = {
//   roles: [],
//   menus: [],
//   permissions: [],
//   selectedRoleId: '',
//   selectedMenuId: '',
//   selectedPermissions: [],
//   loading: {
//     roles: false,
//     menus: false,
//     permissions: false,
//     removing: false,
//     initial: false,
//   },
//   error: null,
//   successMessage: null,
//   dropdownStates: {
//     role: false,
//     menu: false,
//   },
// };

// const removePermissionSlice = createSlice({
//   name: 'removePermissions',
//   initialState,
//   reducers: {
//     // UI State Management
//     setSelectedRoleId: (state, action) => {
//       state.selectedRoleId = action.payload;
//       state.selectedPermissions = []; // Reset permissions when role changes
//     },
//     setSelectedMenuId: (state, action) => {
//       state.selectedMenuId = action.payload;
//       state.selectedPermissions = []; // Reset permissions when menu changes
//     },
//     togglePermission: (state, action) => {
//       const permissionId = action.payload;
//       const index = state.selectedPermissions.indexOf(permissionId);
      
//       if (index === -1) {
//         state.selectedPermissions.push(permissionId);
//       } else {
//         state.selectedPermissions.splice(index, 1);
//       }
//     },
//     setSelectedPermissions: (state, action) => {
//       state.selectedPermissions = action.payload;
//     },
    
//     // Dropdown State Management
//     toggleRoleDropdown: (state) => {
//       state.dropdownStates.role = !state.dropdownStates.role;
//       state.dropdownStates.menu = false; // Close other dropdown
//     },
//     toggleMenuDropdown: (state) => {
//       state.dropdownStates.menu = !state.dropdownStates.menu;
//       state.dropdownStates.role = false; // Close other dropdown
//     },
//     closeDropdowns: (state) => {
//       state.dropdownStates.role = false;
//       state.dropdownStates.menu = false;
//     },
    
//     // Error and Success Management
//     clearError: (state) => {
//       state.error = null;
//     },
//     clearSuccessMessage: (state) => {
//       state.successMessage = null;
//     },
//     clearMessages: (state) => {
//       state.error = null;
//       state.successMessage = null;
//     },
    
//     // Data Management
//     clearPermissions: (state) => {
//       state.permissions = [];
//     },
//     resetForm: (state) => {
//       state.selectedRoleId = '';
//       state.selectedMenuId = '';
//       state.selectedPermissions = [];
//       state.dropdownStates.role = false;
//       state.dropdownStates.menu = false;
//       state.error = null;
//       state.successMessage = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Roles
//       .addCase(fetchRoles.pending, (state) => {
//         state.loading.roles = true;
//         state.error = null;
//       })
//       .addCase(fetchRoles.fulfilled, (state, action) => {
//         state.loading.roles = false;
//         state.roles = action.payload || [];
//       })
//       .addCase(fetchRoles.rejected, (state, action) => {
//         state.loading.roles = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Menus
//       .addCase(fetchMenus.pending, (state) => {
//         state.loading.menus = true;
//         state.error = null;
//       })
//       .addCase(fetchMenus.fulfilled, (state, action) => {
//         state.loading.menus = false;
//         state.menus = action.payload || [];
//       })
//       .addCase(fetchMenus.rejected, (state, action) => {
//         state.loading.menus = false;
//         state.error = action.payload;
//       })
      
//       // Fetch Permissions
//       .addCase(fetchPermissions.pending, (state) => {
//         state.loading.permissions = true;
//         state.error = null;
//       })
//       .addCase(fetchPermissions.fulfilled, (state, action) => {
//         state.loading.permissions = false;
//         state.permissions = action.payload || [];
//       })
//       .addCase(fetchPermissions.rejected, (state, action) => {
//         state.loading.permissions = false;
//         state.error = action.payload;
//       })
      
//       // Remove Role Menu Permissions
//       .addCase(removeRoleMenuPermissions.pending, (state) => {
//         state.loading.removing = true;
//         state.error = null;
//         state.successMessage = null;
//       })
//       .addCase(removeRoleMenuPermissions.fulfilled, (state, action) => {
//         state.loading.removing = false;
//         state.successMessage = 'Permissions removed successfully';
//         // Reset form on successful removal
//         state.selectedRoleId = '';
//         state.selectedMenuId = '';
//         state.selectedPermissions = [];
//       })
//       .addCase(removeRoleMenuPermissions.rejected, (state, action) => {
//         state.loading.removing = false;
//         state.error = action.payload;
//       });
//   },
// });

// // Export actions
// export const {
//   setSelectedRoleId,
//   setSelectedMenuId,
//   togglePermission,
//   setSelectedPermissions,
//   toggleRoleDropdown,
//   toggleMenuDropdown,
//   closeDropdowns,
//   clearError,
//   clearSuccessMessage,
//   clearMessages,
//   clearPermissions,
//   resetForm,
// } = removePermissionSlice.actions;

// // Export selectors
// export const selectRoles = (state) => state.removePermissions.roles;
// export const selectMenus = (state) => state.removePermissions.menus;
// export const selectPermissions = (state) => state.removePermissions.permissions;
// export const selectSelectedRoleId = (state) => state.removePermissions.selectedRoleId;
// export const selectSelectedMenuId = (state) => state.removePermissions.selectedMenuId;
// export const selectSelectedPermissions = (state) => state.removePermissions.selectedPermissions;
// export const selectLoading = (state) => state.removePermissions.loading;
// export const selectError = (state) => state.removePermissions.error;
// export const selectSuccessMessage = (state) => state.removePermissions.successMessage;
// export const selectDropdownStates = (state) => state.removePermissions.dropdownStates;

// // Complex selectors
// export const selectSelectedRole = (state) => {
//   const roleId = state.removePermissions.selectedRoleId;
//   return state.removePermissions.roles.find(role => role.roleID === roleId) || null;
// };

// export const selectSelectedMenu = (state) => {
//   const menuId = state.removePermissions.selectedMenuId;
//   return state.removePermissions.menus.find(menu => 
//     menu.id === menuId || menu.menuId === menuId || menu.menuID === menuId
//   ) || null;
// };

// export const selectSelectedPermissionObjects = (state) => {
//   const selectedIds = state.removePermissions.selectedPermissions;
//   return state.removePermissions.permissions.filter(permission => 
//     selectedIds.includes(permission.id)
//   );
// };

// export const selectIsFormValid = (state) => {
//   return state.removePermissions.selectedRoleId && 
//          state.removePermissions.selectedMenuId && 
//          state.removePermissions.selectedPermissions.length > 0;
// };

// export const selectIsInitialLoading = (state) => {
//   return state.removePermissions.loading.roles || state.removePermissions.loading.menus;
// };

// export default removePermissionSlice.reducer;