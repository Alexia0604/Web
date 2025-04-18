import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTimes } from "react-icons/fa";
import { CiMenuFries } from "react-icons/ci";
import { useAuth } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Circle as CircleIcon
} from '@mui/icons-material';
import axios from 'axios';

const NavyBar = () => {
    const [click, setClick] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const dropdownRef = useRef(null);
    
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
    
    // Toggle dropdown
    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    // Handler pentru deconectare
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            closeMobileMenu();
            setProfileDropdownOpen(false);
        } catch (error) {
            console.error('Eroare la deconectare:', error);
        }
    };

    // Click outside dropdown handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    //scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Funcție pentru a încărca notificările
    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/forum/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Eroare la încărcarea notificărilor:', error);
        }
    };

    // Încărcăm notificările la montarea componentei și când utilizatorul este autentificat
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            // Reîmprospătăm notificările la fiecare minut
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleNotificationsClick = (event) => {
        setNotificationsAnchorEl(event.currentTarget);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Marcăm notificarea ca citită
            await axios.put(`/api/forum/notifications/${notification._id}/read`);
            
            // Navigăm către topic
            if (notification.type === 'new_topic') {
                navigate(`/forum/topic/${notification.topic._id}`);
            } else {
                navigate(`/forum/topic/${notification.topic._id}#comment-${notification.comment}`);
            }
            
            handleNotificationsClose();
            fetchNotifications();
        } catch (error) {
            console.error('Eroare la procesarea notificării:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.put('/api/forum/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Eroare la marcarea notificărilor ca citite:', error);
        }
    };

    const navVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                type: "spring", 
                stiffness: 100, 
                duration: 0.5 
            }
        }
    };

    const menuItemVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: i => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
                duration: 0.5
            }
        })
    };

    // Itemi de meniu de bază (accesibili pentru toți)
    const baseMenuItems = [
        { title: "Acasă", path: "/" },
        { title: "Enciclopedie", path: "/encyclopedia" },
        { title: "Căutare", path: "/search" },
        { title: "Forum", path: "/forum" }
    ];
    
    // Itemi de meniu pentru utilizatori autentificați (user și admin)
    const authMenuItems = [
        { title: "Jocuri", path: "/games" },
        { title: "Favorite", path: "/favorites" }
    ];
    
    // Itemi de meniu pentru administratori
    const adminMenuItems = [
        { title: "Admin", path: "/admin" }
    ];
    
    // Itemi de meniu pentru footer-ul paginii
    const footerMenuItems = [
        { title: "Contact", path: "/contact" }
    ];
    
    // Combinăm toți itemii de meniu în funcție de rolul utilizatorului
    let menuItems = [...baseMenuItems];
    
    if (isAuthenticated) {
        menuItems = [...menuItems, ...authMenuItems];
        
        // Verificare directă a rolului utilizatorului
        if (user && user.role === 'admin') {
            console.log('NavyBar: User is admin, adding admin menu items');
            menuItems = [...menuItems, ...adminMenuItems];
        } else {
            console.log('NavyBar: User is not admin', user);
        }
    }
    
    menuItems = [...menuItems, ...footerMenuItems];

    const mobileMenu = (
        <motion.div 
            className="lg:hidden block absolute top-16 w-full left-0 right-0 bg-white shadow-lg rounded-b-2xl border-t border-gray-100 z-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
        >
            <ul className="text-center p-6 space-y-2">
                {menuItems.map((item, index) => (
                    <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="my-3"
                    >
                        <Link 
                            to={item.path}
                            className="block py-3 px-4 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-all"
                            onClick={closeMobileMenu}
                        >
                            {item.title}
                        </Link>
                    </motion.li>
                ))}
                
                {isAuthenticated ? (
                    <motion.div 
                        className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link to="/profile" onClick={closeMobileMenu}>
                            <button className="w-full py-3 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition">
                                Profil
                            </button>
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                        >
                            Deconectare
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link to="/login" onClick={closeMobileMenu}>
                            <button className="w-full py-3 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition">
                                Autentificare
                            </button>
                        </Link>
                        <Link to="/signup" onClick={closeMobileMenu}>
                            <button className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                                Înregistrare
                            </button>
                        </Link>
                    </motion.div>
                )}
            </ul>
        </motion.div>
    );

    return (
        <motion.nav 
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                scrolled 
                ? "bg-white shadow-lg py-2" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600 py-4"
            }`}
            variants={navVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* nume aplicatie */}
                    <Link to="/" className="flex items-center">
                        <span className={`font-bold text-xl ${scrolled ? 'text-indigo-600' : 'text-white'}`}>
                            BirdHub
                        </span>
                    </Link>
                    
                    {/* menu */}
                    <div className="hidden lg:flex items-center justify-between gap-2">
                        {/* linkutile de navigare */}
                        <div className="flex-1 flex items-center">
                            <ul className="flex space-x-1">
                                {menuItems.map((item, index) => (
                                    <motion.li 
                                        key={index}
                                        custom={index}
                                        variants={menuItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <Link 
                                            to={item.path}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                scrolled 
                                                ? "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50" 
                                                : "text-indigo-100 hover:text-white hover:bg-indigo-500"
                                            }`}
                                        >
                                            {item.title}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* butoane de login/signup sau profil/logout */}
                        <motion.div 
                            className="flex items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            {isAuthenticated ? (
                                <>
                                    {/* Buton notificări */}
                                    <IconButton
                                        color="inherit"
                                        onClick={handleNotificationsClick}
                                        sx={{ color: scrolled ? 'inherit' : 'white' }}
                                    >
                                        <Badge badgeContent={unreadCount} color="error">
                                            <NotificationsIcon />
                                        </Badge>
                                    </IconButton>

                                    {/* Meniu notificări */}
                                    <Menu
                                        anchorEl={notificationsAnchorEl}
                                        open={Boolean(notificationsAnchorEl)}
                                        onClose={handleNotificationsClose}
                                        PaperProps={{
                                            sx: { width: 350, maxHeight: 400 }
                                        }}
                                    >
                                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6">Notificări</Typography>
                                            {unreadCount > 0 && (
                                                <Button size="small" onClick={handleMarkAllRead}>
                                                    Marchează toate ca citite
                                                </Button>
                                            )}
                                        </Box>
                                        <Divider />
                                        {notifications.length === 0 ? (
                                            <MenuItem disabled>
                                                <ListItemText primary="Nu ai notificări" />
                                            </MenuItem>
                                        ) : (
                                            notifications.map((notification) => (
                                                <MenuItem
                                                    key={notification._id}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    sx={{
                                                        backgroundColor: notification.read ? 'inherit' : 'action.hover',
                                                        whiteSpace: 'normal'
                                                    }}
                                                >
                                                    <ListItemIcon>
                                                        {!notification.read && (
                                                            <CircleIcon color="primary" sx={{ fontSize: 12 }} />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={notification.message}
                                                        secondary={new Date(notification.createdAt).toLocaleString()}
                                                    />
                                                </MenuItem>
                                            ))
                                        )}
                                    </Menu>

                                    {/* Restul meniului pentru utilizator autentificat */}
                                    <IconButton
                                        color="inherit"
                                        onClick={(e) => setAnchorEl(e.currentTarget)}
                                    >
                                        {user?.profileImage ? (
                                            <Avatar src={user.profileImage} sx={{ width: 32, height: 32 }} />
                                        ) : (
                                            <AccountCircle />
                                        )}
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={() => setAnchorEl(null)}
                                    >
                                        <MenuItem onClick={() => {
                                            setAnchorEl(null);
                                            navigate('/profile');
                                        }}>
                                            <ListItemIcon>
                                                <Settings fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary="Profil" />
                                        </MenuItem>
                                        <MenuItem onClick={() => {
                                            setAnchorEl(null);
                                            logout();
                                            navigate('/');
                                        }}>
                                            <ListItemIcon>
                                                <Logout fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary="Deconectare" />
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <button className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            scrolled 
                                            ? "text-indigo-600 border border-indigo-600 hover:bg-indigo-50" 
                                            : "text-white border border-white hover:bg-indigo-500"
                                        }`}>
                                            Autentificare
                                        </button>
                                    </Link>
                                    <Link to="/signup">
                                        <button className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            scrolled 
                                            ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                                            : "bg-white text-indigo-600 hover:bg-gray-100"
                                        }`}>
                                            Înregistrare
                                        </button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </div>
                    
                    {/* buton meniu telefon */}
                    <motion.button 
                        className="block lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleClick}
                    >
                        {click ? (
                            <FaTimes className={`w-6 h-6 ${scrolled ? 'text-indigo-600' : 'text-white'}`} />
                        ) : (
                            <CiMenuFries className={`w-6 h-6 ${scrolled ? 'text-indigo-600' : 'text-white'}`} />
                        )}
                    </motion.button>
                </div>
            </div>
            
            {/* meniu telefon */}
            {click && mobileMenu}
        </motion.nav>
    );
};

export default NavyBar;