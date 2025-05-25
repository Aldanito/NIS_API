import React, { useState, useMemo, memo, useCallback } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Collapse,
    IconButton,
    Box,
    ListSubheader,
    LinearProgress,
    Paper,
    Tooltip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Book as BookIcon,
    QuizOutlined as QuizIcon,
    Add as AddIcon,
    Key as KeyIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Menu as MenuIcon
} from '@mui/icons-material';


const Sidebar = memo(({
    activeView,
    onNavigate,
    userProgress = {},
    isCollapsed = false,
    onToggleCollapse
}) => {
    const [expandedSections, setExpandedSections] = useState({
        learning: true,
        management: false,
        tools: false
    });

    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    const navigationItems = useMemo(() => ({
        learning: [
            {
                id: 'dashboard',
                label: 'Панель управления',
                icon: <DashboardIcon />,
                count: null
            },
            {
                id: 'courses',
                label: 'Мои курсы',
                icon: <BookIcon />,
                count: null
            }
        ],
        management: [
            {
                id: 'create-quiz',
                label: 'Создать квиз',
                icon: <QuizIcon />,
                count: null
            },
            {
                id: 'create-course',
                label: 'Создать курс',
                icon: <AddIcon />,
                count: null
            }
        ],
        tools: [
            {
                id: 'token-access',
                label: 'Доступ по токену',
                icon: <KeyIcon />,
                count: null
            }
        ]
    }), [userProgress.enrolledCourses, userProgress.completedVideos]);

    const handleNavigation = useCallback((viewId) => {
        if (typeof onNavigate === 'function') {
            onNavigate(viewId);
        } else {
            console.warn('onNavigate is not a function. Navigation might not work properly.');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [onNavigate]);

    const drawerWidth = isCollapsed ? 65 : 240;

    const drawerContent = (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 2,
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                {!isCollapsed && (
                    <Typography variant="h6" component="h1" sx={{ fontWeight: 'medium' }}>
                        Навигация
                    </Typography>
                )}
                {isCollapsed && (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <MenuIcon />
                    </Box>
                )}
                <IconButton onClick={onToggleCollapse} size="small">
                    {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>

            <Box sx={{ overflow: 'auto', mt: 1 }}>
                {/* Learning Section */}
                <List
                    subheader={
                        !isCollapsed && (
                            <ListSubheader component="div" sx={{ bgcolor: 'background.paper' }}>
                                ОБУЧЕНИЕ
                            </ListSubheader>
                        )
                    }
                >
                    {!isCollapsed && (
                        <ListItemButton onClick={() => toggleSection('learning')}>
                            <ListItemIcon>
                                <BookIcon />
                            </ListItemIcon>
                            <ListItemText primary="ОБУЧЕНИЕ" />
                            {expandedSections.learning ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                    )}

                    <Collapse in={isCollapsed || expandedSections.learning} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {navigationItems.learning.map((item) => (
                                <Tooltip
                                    key={item.id}
                                    title={isCollapsed ? item.label : ''}
                                    placement="right"
                                    disableHoverListener={!isCollapsed}
                                >
                                    <ListItemButton
                                        selected={activeView === item.id}
                                        onClick={() => handleNavigation(item.id)}
                                        sx={{
                                            pl: isCollapsed ? 2 : 4,
                                            minHeight: 48,
                                            borderRight: activeView === item.id ? 3 : 0,
                                            borderColor: 'primary.main',
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!isCollapsed && <ListItemText primary={item.label} />}
                                        {!isCollapsed && item.count !== null && item.count > 0 && (
                                            <Box
                                                sx={{
                                                    bgcolor: activeView === item.id ? 'primary.light' : 'grey.100',
                                                    color: activeView === item.id ? 'primary.dark' : 'grey.700',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 10,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                {item.count}
                                            </Box>
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            ))}
                        </List>
                    </Collapse>
                </List>

                <Divider />

                {/* Management Section */}
                <List
                    subheader={
                        !isCollapsed && (
                            <ListSubheader component="div" sx={{ bgcolor: 'background.paper' }}>
                                УПРАВЛЕНИЕ
                            </ListSubheader>
                        )
                    }
                >
                    {!isCollapsed && (
                        <ListItemButton onClick={() => toggleSection('management')}>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="УПРАВЛЕНИЕ" />
                            {expandedSections.management ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                    )}

                    <Collapse in={isCollapsed || expandedSections.management} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {navigationItems.management.map((item) => (
                                <Tooltip
                                    key={item.id}
                                    title={isCollapsed ? item.label : ''}
                                    placement="right"
                                    disableHoverListener={!isCollapsed}
                                >
                                    <ListItemButton
                                        selected={activeView === item.id}
                                        onClick={() => handleNavigation(item.id)}
                                        sx={{
                                            pl: isCollapsed ? 2 : 4,
                                            minHeight: 48,
                                            borderRight: activeView === item.id ? 3 : 0,
                                            borderColor: 'primary.main',
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!isCollapsed && <ListItemText primary={item.label} />}
                                    </ListItemButton>
                                </Tooltip>
                            ))}
                        </List>
                    </Collapse>
                </List>

                <Divider />

                {/* Tools Section */}
                <List
                    subheader={
                        !isCollapsed && (
                            <ListSubheader component="div" sx={{ bgcolor: 'background.paper' }}>
                                ИНСТРУМЕНТЫ
                            </ListSubheader>
                        )
                    }
                >
                    {!isCollapsed && (
                        <ListItemButton onClick={() => toggleSection('tools')}>
                            <ListItemIcon>
                                <KeyIcon />
                            </ListItemIcon>
                            <ListItemText primary="ИНСТРУМЕНТЫ" />
                            {expandedSections.tools ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                    )}

                    <Collapse in={isCollapsed || expandedSections.tools} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {navigationItems.tools.map((item) => (
                                <Tooltip
                                    key={item.id}
                                    title={isCollapsed ? item.label : ''}
                                    placement="right"
                                    disableHoverListener={!isCollapsed}
                                >
                                    <ListItemButton
                                        selected={activeView === item.id}
                                        onClick={() => handleNavigation(item.id)}
                                        sx={{
                                            pl: isCollapsed ? 2 : 4,
                                            minHeight: 48,
                                            borderRight: activeView === item.id ? 3 : 0,
                                            borderColor: 'primary.main',
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!isCollapsed && <ListItemText primary={item.label} />}
                                    </ListItemButton>
                                </Tooltip>
                            ))}
                        </List>
                    </Collapse>
                </List>
            </Box>

            {/* Progress Summary at Bottom */}
            {!isCollapsed && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        bgcolor: 'grey.50',
                        mt: 'auto'
                    }}
                >
                    <Typography variant="subtitle2" gutterBottom>
                        Ваш прогресс
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Завершенные курсы
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {userProgress.completedCourses || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Просмотренные видео
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {userProgress.completedVideos || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Пройденные тесты
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {userProgress.completedQuizzes || 0}
                        </Typography>
                    </Box>
                    {userProgress.totalProgress !== undefined && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" display="block" gutterBottom>
                                Общий прогресс
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={userProgress.totalProgress}
                                sx={{ height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" display="block" align="right" sx={{ mt: 0.5 }}>
                                {userProgress.totalProgress}%
                            </Typography>
                        </Box>
                    )}
                </Paper>
            )}
        </>
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: theme => theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
});

export default Sidebar;