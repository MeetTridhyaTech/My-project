import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import Register from "./components/Register"; // Make sure you have a Register component
import UsersList from "./components/ListUser";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import RoleManagement from "./components/RoleManagement"; // import the RoleManagement component
import CreateRole from './components/CreateRole';
import EditRole from './components/EditRole';
import PermissionManagement from './components/PermissionManagement'; 
// import EditPermission from "./components/AssignPermission";
import AssignPermission from "./components/AssignPermission";
import Sidebar from "./components/Sidebar";
import RemovePermission from "./components/RemovePermission";
import Menu from "./components/Menu";
import MenuManagement from "./components/MenuManagement";
import ListPermissions from "./components/ListPermissions";
// import RemovePermission from "./components/RemovePermission";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/userlist" element={<UsersList />} />
        <Route path="/adduser" element={<AddUser/>}/>
        <Route path="/edit-user/:id" element={<EditUser/>}/>
        <Route path="/rolemanagement" element={<RoleManagement />} />
        <Route path="/add-role" element={<CreateRole />} />
        <Route path="/edit-role/:roleId" element={<EditRole />} />
        <Route path="/permissionmanagement" element={<PermissionManagement />} />
        <Route path="/assign-permission" element={<AssignPermission />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/remove-permission" element={<RemovePermission />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu-management" element={<MenuManagement />} />
        <Route path="/list-permissions" element={<ListPermissions />} />
        {/* <Route path="/remove-permission" element={<RemovePermission />} /> */}



        {/* <Route path="/edit-role/:id" element={<EditRole />} /> Add this line */}
        </Routes>
    </Router>
  );
}

export default App;