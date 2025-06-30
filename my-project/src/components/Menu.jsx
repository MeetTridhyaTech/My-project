import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axiosInstance";
import { toast } from "react-hot-toast";
import GlobalLoader from "./GlobalLoader";
import {
  User,
  Users,
  Shield,
  ShieldCheck,
  HousePlus,
  LogOut,
  LayoutDashboard,
  Menu as MenuIcon,
  Settings,
  FileText,
  MessageCircle
} from "lucide-react";

// Icon mapping object
const iconMapping = {
  "User": User,
  "Users": Users,
  "Shield": Shield,
  "ShieldCheck": ShieldCheck,
  "HousePlus": HousePlus,
  "LayoutDashboard": LayoutDashboard,
  "Menu": MenuIcon,
  "Settings": Settings, 
  "FileText": FileText,
  "MessageCircle": MessageCircle,
};
const token = localStorage.getItem("token"); 
// Menu Component
const Menu = ({ activePage }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch menus from backend API
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const menuId = "73B717D1-A5F0-4326-AAE3-6370A2373472";
        const response = await api.get(`Menus/all/${menuId}`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        
        });

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
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 text-blue-300" />;
    }
    
    return <User className="w-5 h-5 text-blue-300" />;
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
            activePage === menu.path
              ? "bg-blue-900 bg-opacity-40"
              : "hover:bg-gray-700"
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
              .map((subMenu, index) => (
                <li key={index} className="space-y-2">
                  <div 
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition duration-300 ${
                      activePage === subMenu.path
                        ? "bg-blue-900 bg-opacity-40"
                        : "hover:bg-gray-700"
                    }`}
                    onClick={() => subMenu.path && navigate(subMenu.path)}
                  >
                    {getIconComponent(subMenu.icon)}
                    <span>{subMenu.title}</span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="w-1/5 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col shadow-xl">
      <h1 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-blue-400" />
        <span className="bg-gradient-to-r from-blue-300 to-indigo-300 text-transparent bg-clip-text">
          Admin Dashboard
        </span>
      </h1>
      
{loading ? (
  <GlobalLoader />
      ) : error ? (
        <div className="text-red-400 text-center p-4">
          {error}
        </div>
      ) : (
        <ul className="space-y-3 flex-grow">
          {menus.length > 0 ? (
            menus.map((menu) => renderMenuItem(menu))
          ) : (
            <li className="text-center text-gray-400 p-4">No menus available</li>
          )}
        </ul>
      )}
      
      <div className="mt-auto pt-4">
        <li
          className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition duration-300 hover:bg-red-700 bg-red-800 bg-opacity-40 list-none"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 text-red-300" /> <span>Logout</span>
        </li>
      </div>
    </div>
  );
};

export default Menu;