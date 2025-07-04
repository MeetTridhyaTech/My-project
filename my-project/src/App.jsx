import { HashRouter as Router, Routes, Route } from "react-router-dom";//BrowserRouter
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import UsersList from "./components/ListUser";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import RoleManagement from "./components/RoleManagement";
import CreateRole from './components/CreateRole';
import EditRole from './components/EditRole';
import PermissionManagement from './components/PermissionManagement'; 
import AssignPermission from "./components/AssignPermission";
import Sidebar from "./components/Sidebar";
import RemovePermission from "./components/RemovePermission";
import Menu from "./components/Menu";
import MenuManagement from "./components/MenuManagement";
import ListPermissions from "./components/ListPermissions";
import AddPermission from "./components/AddPermission";
import PermissionRoute from "./components/PermissionRoute";
import UnauthorizedAccess from "./components/UnauthorizedAccess";
import TableFilter from "./components/TableFilter";
import GlobalLoader from "./components/GlobalLoader";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyOtp from "./components/auth/VerifyOtp";
import ChatMessage from "./components/ChatMessage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/tablefilter" element={<TableFilter/>} /> 
        <Route path="/loader" element={<GlobalLoader/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/chat-message" element={<ChatMessage/>}/>

        
        {/* Protected by PermissionRoute */}
        <Route path="/userlist/:menuId?" element={
          <PermissionRoute permission="Read">
            <UsersList />
          </PermissionRoute>
        } />
        
        <Route path="/adduser/:menuId?" element={
          <PermissionRoute permission="Add">
            <AddUser />
          </PermissionRoute>
        } />

        <Route path="/edit-user/:id/:menuId?" element={
          <PermissionRoute permission="Edit">
            <EditUser />
          </PermissionRoute>
        } />

        <Route path="/rolemanagement/:menuId?" element={
          <PermissionRoute permission="Read">
            <RoleManagement />
          </PermissionRoute>
        } />

        <Route path="/add-role/:menuId?" element={
          <PermissionRoute permission="Add">
            <CreateRole />
          </PermissionRoute>
        } />

        <Route path="/edit-role/:roleId" element={
          <PermissionRoute permission="Edit">
            <EditRole />
          </PermissionRoute>
        } />

        <Route path="/permissionmanagement/:menuId?" element={
          <PermissionRoute permission="Read">
            <PermissionManagement />
          </PermissionRoute>
        } />

        <Route path="/assign-permission/:menuId?" element={
          <PermissionRoute permission="Add">
            <AssignPermission />
          </PermissionRoute>
        } />

        <Route path="/remove-permission/:menuId?" element={
          <PermissionRoute permission="Delete">
            <RemovePermission />
          </PermissionRoute>
        } />

        <Route path="/menu/:menuId?" element={<Menu />} />
        <Route path="/menu-management/:menuId?" element={<MenuManagement />} />

        <Route path="/list-permissions" element={
          <PermissionRoute permission="Read">
            <ListPermissions />
          </PermissionRoute>
        } />

        <Route path="/list-permissions/:menuId?" element={
          <PermissionRoute permission="Read">
            <RemovePermission />
          </PermissionRoute>
        } />

        <Route path="/addpermission/:menuId?" element={
          <PermissionRoute permission="Add">
            <AddPermission />
          </PermissionRoute>
        } />

        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/unauthorizeaccess" element={<UnauthorizedAccess />} />
      </Routes>
    </Router>
  );
}

export default App;