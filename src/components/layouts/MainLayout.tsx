import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Toolbar, Typography, useTheme, Button, Avatar, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectAuth } from '../../store/slices/authSlice';

const drawerWidth = 240;

const MainLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };
  
  const menuItems = [
    { text: 'Trang chủ', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Sinh viên', icon: <PeopleIcon />, path: '/students' },
    { text: 'Giáo viên', icon: <SchoolIcon />, path: '/teachers' },
    { text: 'Lớp học', icon: <ClassIcon />, path: '/classes' },
    { text: 'Lịch học', icon: <CalendarMonthIcon />, path: '/schedule' },
    { text: 'Điểm danh', icon: <AssignmentIcon />, path: '/attendance' },
  ];
  
  const drawer = (
    <div>
      <Toolbar sx={{ background: theme.palette.secondary.main, color: theme.palette.secondary.contrastText }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo.png" 
            alt="UTT Logo" 
            style={{ height: '32px', width: 'auto', marginRight: '8px' }}
          />
          <Typography variant="h6" noWrap component="div">
            UTT School
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigate(item.path)}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '20',
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '30',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '40',
                  }
                }
              }}
              selected={window.location.pathname === item.path}
            >
              <ListItemIcon sx={{ color: window.location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.secondary.main,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img 
              src="/logo.png" 
              alt="UTT Logo" 
              style={{ 
                height: '32px', 
                width: 'auto', 
                marginRight: '8px' 
              }}
            />
          </Box>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            UTT School - Hệ thống quản lý trường học
          </Typography>
          
          <Box>
            <Button 
              color="inherit" 
              onClick={handleProfileMenuOpen}
              startIcon={
                user && typeof user === 'object' && 'avatar_url' in user && user.avatar_url ? 
                <Avatar 
                  alt={user?.name || 'User'} 
                  src={String(user.avatar_url)} 
                  sx={{ width: 32, height: 32, border: `2px solid ${theme.palette.primary.main}` }}
                /> :
                <Avatar 
                  alt={user?.name || 'User'} 
                  sx={{ width: 32, height: 32, border: `2px solid ${theme.palette.primary.main}` }}
                />
              }
            >
              {user?.name || 'Người dùng'}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => {
                handleProfileMenuClose();
                navigate('/profile');
              }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                </ListItemIcon>
                <Typography variant="inherit">Hồ sơ</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                </ListItemIcon>
                <Typography variant="inherit">Đăng xuất</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 