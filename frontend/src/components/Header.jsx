import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Badge,
    InputBase,
    Button,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Drawer,
    useScrollTrigger,
    Paper
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    VideoLibrary as VideoLibraryIcon
} from '@mui/icons-material';
import { alpha, styled } from '@mui/material/styles';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
    border: '1px solid',
    borderColor: theme.palette.divider,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const Header = memo(({ user, onLogout, onNavigate }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const searchInputRef = useRef(null);
    const buttonRef = useRef(null);

    const scrollTrigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 10,
    });

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
        }
    }, [searchQuery]);

    const handleProfileMenuOpen = (event) => {
        setIsProfileMenuOpen(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setIsProfileMenuOpen(null);
    };

    const handleLogout = useCallback(() => {
        handleProfileMenuClose();
        if (onLogout) onLogout();
    }, [onLogout]);

    const handleMobileMenuToggle = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const handleNavigation = useCallback((route) => {
        if (onNavigate) {
            onNavigate(route);
        }
        setIsMobileMenuOpen(false);
        handleProfileMenuClose();
    }, [onNavigate]);

    return (
        <>
            <AppBar position="sticky" color="default" sx={{
                bgcolor: 'white',
                boxShadow: scrollTrigger ? 3 : 1
            }}>
                <Toolbar>
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <Button
                            color="primary"
                            onClick={() => handleNavigation('dashboard')}
                            sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                        >
                            NIS Learning
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <IconButton color="inherit" sx={{ ml: 1 }}>
                            <Badge badgeContent="" color="error" variant="dot">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        {user ? (
                            <Box sx={{ ml: 1.5 }}>
                                <IconButton
                                    ref={buttonRef}
                                    onClick={handleProfileMenuOpen}
                                    edge="end"
                                    sx={{
                                        p: 0.5,
                                        border: isProfileMenuOpen ? '2px solid' : 'none',
                                        borderColor: 'primary.main'
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: 'primary.main',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        display: { xs: 'none', md: 'inline-block' },
                                        ml: 1
                                    }}
                                >

                                </Typography>

                                <Menu
                                    id="user-menu"
                                    anchorEl={isProfileMenuOpen}
                                    open={Boolean(isProfileMenuOpen)}
                                    onClose={handleProfileMenuClose}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    PaperProps={{
                                        elevation: 3,
                                        sx: {
                                            width: 240,
                                            mt: 0.5
                                        }
                                    }}
                                >
                                    <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="subtitle2">{user.username}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {user.email || 'user@example.com'}
                                        </Typography>
                                    </Box>

                                    <MenuItem onClick={() => handleNavigation('profile')}>
                                        <ListItemIcon>
                                            <PersonIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Мой профиль" />
                                    </MenuItem>

                                    <MenuItem onClick={() => handleNavigation('settings')}>
                                        <ListItemIcon>
                                            <SettingsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Настройки" />
                                    </MenuItem>

                                    <Divider />

                                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText primary="Выйти" />
                                    </MenuItem>
                                </Menu>
                            </Box>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleNavigation('login')}
                                sx={{ ml: 2 }}
                            >
                                Войти
                            </Button>
                        )}

                        <IconButton
                            color="inherit"
                            sx={{ ml: 1, display: { xs: 'inline-flex', md: 'none' } }}
                            onClick={handleMobileMenuToggle}
                        >
                            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="top"
                open={isMobileMenuOpen}
                onClose={handleMobileMenuToggle}
                sx={{
                    '& .MuiDrawer-paper': {
                        top: '64px'
                    }
                }}
            >
                <Paper sx={{ width: '100%' }}>
                    <Box sx={{ p: 2 }}>
                        <Search sx={{ width: '100%' }}>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                fullWidth
                                ref={searchInputRef}
                                placeholder="Поиск курсов..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Search>
                    </Box>

                    <List>
                        <ListItem button onClick={() => handleNavigation('dashboard')}>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Панель управления" />
                        </ListItem>

                        <ListItem button onClick={() => handleNavigation('courses')}>
                            <ListItemIcon>
                                <SchoolIcon />
                            </ListItemIcon>
                            <ListItemText primary="Мои курсы" />
                        </ListItem>

                        <ListItem button onClick={() => handleNavigation('videos')}>
                            <ListItemIcon>
                                <VideoLibraryIcon />
                            </ListItemIcon>
                            <ListItemText primary="Видеоуроки" />
                        </ListItem>
                    </List>
                </Paper>
            </Drawer>
        </>
    );
});

export default Header;