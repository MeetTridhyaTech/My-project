import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  User,
  Users,
  Shield,
  ShieldCheck,
  HousePlus,
  LogOut,
  LayoutGrid,
  LayoutDashboard,
  Menu as MenuIcon,
  Settings,
  ShoppingCart,
  FileText,
  MessageCircle 
} from "lucide-react";

// Create an Axios instance with the base URL from the environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Icon mapping object
const iconMapping = {
  User: User,
  Users: Users,
  LayoutGrid: LayoutGrid,
  Shield: Shield,
  ShieldCheck: ShieldCheck,
  HousePlus: HousePlus,
  LayoutDashboard: LayoutDashboard,
  Menu: MenuIcon,
  ShoppingCart: ShoppingCart,
  Settings: Settings,
  FileText: FileText,
  MessageCircle: MessageCircle
};
// const token = localStorage.getItem("token");
// const roleName = localStorage.getItem("roleName");

// Sidebar Component
const Sidebar = ({ activePage }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleName, setRoleName] = useState(null);
  // const [token, setToken] = useState(null);
  const navigate = useNavigate();

    useEffect(() => {
    // setToken(localStorage.getItem("token"));
    setRoleName(localStorage.getItem("roleName"));
  }, []);

  // Fetch menus from backend API
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); 
        const menuId = "73B717D1-A5F0-4326-AAE3-6370A2373472";
        const response = await api.get(`Menus/all/${menuId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
console.log("Token for Menumanagement",token);
console.log("Menus Response:", response.data); // Log the response data
        if (Array.isArray(response.data)) {
          // Sort menus by their order property
          const sortedMenus = response.data.sort((a, b) => a.order - b.order);
          setMenus(sortedMenus);
        } else {
          console.error("Expected an array, but got:", response.data);
          setError("Invalid menu data format");
        }
      } catch (error) {
        console.error("Error fetching menus", error);
        setError("Failed to load menus");
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const handleLogout = () => {
    toast.success("Logged out successfully", {
      icon: "👋",
      duration: 3000,
      style: {
        background: "#f8f9fa",
        border: "1px solid #dee2e6",
        padding: "16px",
        color: "#212529",
      },
    });
    navigate("/login");
  };

  // Get icon component based on string name
  const getIconComponent = (iconName) => {
    if (!iconName) return <User className="w-5 h-5 text-blue-300" />;
    const IconComponent = iconMapping[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5 text-blue-300" /> : <User className="w-5 h-5 text-blue-300" />;
  };
  const hasPermission = (menu) => {
  if (!menu.roleName || !roleName) return false;
  
  const allowedRoles = menu.roleName.split(',').map(role => role.trim().toLowerCase());
  return allowedRoles.includes(roleName.toLowerCase());
};


  // Render menu item with possible submenus
  const renderMenuItem = (menu) => {
    if (!hasPermission(menu)) return null;

    const menuIcon = getIconComponent(menu.icon);

    return (
      <li key={menu.id} className="space-y-2">
        {/* Main menu item */}
        <div
          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition duration-300 ${
            activePage === menu.path ? "bg-blue-900 bg-opacity-40" : "hover:bg-gray-700"
          }`}
          onClick={() => menu.path && navigate(menu.path)}
        >
          {menuIcon}
          <span>{menu.title}</span>
        </div>

        {/* Render submenus if they exist */}
        {menu.subMenus && menu.subMenus.length > 0 && (
          <ul className="pl-6 space-y-2">
            {menu.subMenus
              .sort((a, b) => a.order - b.order) // Sort submenus by order
              .map((subMenu, index) => renderMenuItem(subMenu))}
          </ul>
        )}
      </li>
    );
  };

return (
  <div className="w-1/5 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col shadow-xl">
    <h1 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
      <LayoutDashboard className="w-6 h-6 text-blue-400" />
      <span className="bg-gradient-to-r from-blue-300 to-indigo-300 text-transparent bg-clip-text">Dashboard</span>
    </h1>

    {loading ? (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-300"></div>
      </div>
    ) : error ? (
      <div className="text-red-400 text-center p-4">{error}</div>
    ) : (
      <ul className="space-y-3">
        {menus.length > 0 ? (
          menus.map((menu) => renderMenuItem(menu))
        ) : (
          <li className="text-center text-gray-400 p-4">No menus available</li>
        )}

        {/* Logout menu item */}
        <li
          className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition duration-300 hover:bg-red-700 bg-red-800 bg-opacity-40"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 text-red-300" />
          <span>Logout</span>
        </li>
      </ul>
    )}
  </div>
);

};

export default Sidebar;
