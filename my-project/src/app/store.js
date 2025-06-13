import { configureStore } from '@reduxjs/toolkit';
import  userReducer  from '../../features/Users/UserSlice';
import roleReducer from '../../features/Roles/RoleSlice';
import permissionReducer from '../../features/Permissions/permissionSlice';
import rolePermissionReducer from '../../features/RoleMenuPermissions/RoleMenuPermissionSlice';
import assignPermissionReducer from '../../features/assignPermissions/assignPermissionSlice';
import menuReducer from '../../features/menus/menuSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    rolePermissions: rolePermissionReducer,
    assignPermissions: assignPermissionReducer,
    menus: menuReducer,
  },
});

export default store;
