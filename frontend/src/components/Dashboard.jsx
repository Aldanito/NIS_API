import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { lessonsAPI, categoriesAPI } from '../services/api';
import {
    Card,
    Badge,
    Button
} from './ui/UIComponents';
import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    CircularProgress,
    LinearProgress,
    Stack,
    Avatar,
    Divider,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';


const GradientBox = styled(Box)(({ theme, gradient }) => ({
    background: gradient || `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
}));

const StyledIconWrapper = styled(Box)(({ theme, bgcolor }) => ({
    backgroundColor: bgcolor || theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
    transition: 'background-color 0.2s',
}));


const DashboardLoading = memo(() => (
    <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="400px"
        sx={{
            background: (theme) => `linear-gradient(to bottom right, ${theme.palette.grey[50]}, ${theme.palette.primary[50]})`,
        }}
        role="status"
        aria-live="polite"
    >
        <Box textAlign="center">
            <CircularProgress size={64} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight="medium">
                Загружаем ваш учебный план...
            </Typography>
        </Box>
    </Box>
));

// Hero Section component
const HeroSection = memo(({ user, greeting, stats }) => (
    <Box
        sx={{
            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 60%, ${theme.palette.secondary.dark} 100%)`,
            color: 'white',
            py: 6
        }}
    >
        <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                    <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                        {user ? `${greeting}, ${user.first_name || user.username}! 👋` : 'Добро пожаловать в NIS Learning! 🎓'}
                    </Typography>
                    <Typography variant="h6" color="rgba(255,255,255,0.9)" paragraph sx={{ maxWidth: '600px' }}>
                        {user
                            ? 'Продолжайте развивать свои навыки с нашими курсами мирового класса'
                            : 'Изучайте новые навыки с лучшими онлайн-курсами от ведущих экспертов'
                        }
                    </Typography>
                    {!user && (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
                            <Button
                                variant="contained"
                                color="inherit"
                                sx={{
                                    color: (theme) => theme.palette.primary.main,
                                    bgcolor: 'white',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                                }}
                                aria-label="Зарегистрироваться бесплатно"
                            >
                                Начать бесплатно
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        borderColor: 'white'
                                    }
                                }}
                                aria-label="Перейти к просмотру доступных курсов"
                            >
                                Посмотреть курсы
                            </Button>
                        </Stack>
                    )}
                </Grid>
                {user && (
                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 4,
                                p: 3
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="medium" mb={2}>
                                Ваш прогресс этого месяца
                            </Typography>
                            <Box mb={2}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Изучено курсов</Typography>
                                    <Typography variant="body2">{stats.monthlyProgress}/{stats.monthlyGoal}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(stats.monthlyProgress / stats.monthlyGoal) * 100}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'white'
                                        }
                                    }}
                                />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Дней подряд</Typography>
                                <Typography variant="h5" fontWeight="bold">{stats.studyStreak} 🔥</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Container>
    </Box>
));

// Stats Card component
const StatsCard = memo(({ icon, title, value, subtitle, bgColor }) => (
    <Paper
        elevation={2}
        sx={{
            p: 3,
            borderRadius: 2,
            transition: 'box-shadow 0.3s',
            '&:hover': {
                boxShadow: 6
            }
        }}
    >
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {subtitle}
                </Typography>
            </Box>
            <Avatar
                sx={{
                    bgcolor: bgColor || 'primary.light',
                    width: 48,
                    height: 48
                }}
            >
                {icon}
            </Avatar>
        </Box>
    </Paper>
));

// Stats Section component
const StatsSection = memo(({ stats, onCourseSelect }) => (
    <Box sx={{ mt: -8, position: 'relative', zIndex: 10, mb: 6 }}>
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Всего курсов"
                        value={stats.totalCourses}
                        subtitle="доступно для изучения"
                        bgColor="primary.light"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="В процессе"
                        value={stats.enrolledCourses}
                        subtitle="активных курсов"
                        bgColor="success.light"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Завершено"
                        value={stats.completedCourses}
                        subtitle="курсов пройдено"
                        bgColor="secondary.light"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Средний балл"
                        value={`${stats.averageScore}%`}
                        subtitle="по всем тестам"
                        bgColor="warning.light"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        }
                    />
                </Grid>
            </Grid>
        </Container>
    </Box>
));

// Quick Actions component
const QuickActions = memo(({ onCourseSelect }) => (
    <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
            Быстрые действия
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <Paper
                    onClick={() => onCourseSelect && onCourseSelect('courses')}
                    sx={{
                        p: 2,
                        bgcolor: 'primary.50',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'primary.100',
                            transform: 'translateY(-2px)'
                        },
                        '&:focus': {
                            outline: 'none',
                            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`
                        }
                    }}
                    component="button"
                    elevation={0}
                >
                    <Avatar
                        sx={{
                            bgcolor: 'primary.main',
                            mr: 2,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </Avatar>
                    <Box textAlign="left">
                        <Typography variant="subtitle2" color="text.primary">Найти курс</Typography>
                        <Typography variant="body2" color="text.secondary">Изучить каталог</Typography>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper
                    onClick={() => onCourseSelect && onCourseSelect('quiz-creator')}
                    sx={{
                        p: 2,
                        bgcolor: 'success.50',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'success.100',
                            transform: 'translateY(-2px)'
                        },
                        '&:focus': {
                            outline: 'none',
                            boxShadow: (theme) => `0 0 0 2px ${theme.palette.success.main}`
                        }
                    }}
                    component="button"
                    elevation={0}
                >
                    <Avatar
                        sx={{
                            bgcolor: 'success.main',
                            mr: 2,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: 'success.dark'
                            }
                        }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </Avatar>
                    <Box textAlign="left">
                        <Typography variant="subtitle2" color="text.primary">Создать тест</Typography>
                        <Typography variant="body2" color="text.secondary">Новая викторина</Typography>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper
                    onClick={() => onCourseSelect && onCourseSelect('upload')}
                    sx={{
                        p: 2,
                        bgcolor: 'secondary.50',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'secondary.100',
                            transform: 'translateY(-2px)'
                        },
                        '&:focus': {
                            outline: 'none',
                            boxShadow: (theme) => `0 0 0 2px ${theme.palette.secondary.main}`
                        }
                    }}
                    component="button"
                    elevation={0}
                >
                    <Avatar
                        sx={{
                            bgcolor: 'secondary.main',
                            mr: 2,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: 'secondary.dark'
                            }
                        }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </Avatar>
                    <Box textAlign="left">
                        <Typography variant="subtitle2" color="text.primary">Загрузить</Typography>
                        <Typography variant="body2" color="text.secondary">Добавить материалы</Typography>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    </Card>
));

// Categories Section component
const CategoryItem = memo(({ category, index, onCourseSelect }) => {
    const colors = [
        'primary',
        'success',
        'secondary',
        'warning',
        'info',
        'error'
    ];
    const color = colors[index % colors.length];
    const courseCount = Math.floor(Math.random() * 20) + 5;

    return (
        <Paper
            onClick={() => onCourseSelect && onCourseSelect('courses', { category: category.id })}
            sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 4,
                background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.05)'
                },
                '&:focus': {
                    outline: 'none',
                    boxShadow: (theme) => `0 0 0 3px ${theme.palette[color].light}`
                }
            }}
            role="button"
            aria-label={`Просмотреть категорию ${category.title} (${courseCount} курсов)`}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCourseSelect && onCourseSelect('courses', { category: category.id });
                }
            }}
            elevation={2}
        >
            <Typography variant="h4" gutterBottom aria-hidden="true">📚</Typography>
            <Typography variant="subtitle2" fontWeight="medium">{category.title}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>{courseCount} курсов</Typography>
        </Paper>
    );
});

const CategoriesSection = memo(({ categories, onCourseSelect }) => (
    <Box mb={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
                Изучайте по категориям
            </Typography>
        </Box>
        <Grid container spacing={2}>
            {categories.map((category, index) => (
                <Grid item xs={6} md={4} lg={2} key={category.id}>
                    <CategoryItem
                        category={category}
                        index={index}
                        onCourseSelect={onCourseSelect}
                    />
                </Grid>
            ))}
        </Grid>
    </Box>
));

// CourseBadge component
const CourseBadge = memo(({ type, difficulty }) => {
    const accessBadgeConfig = useMemo(() => ({
        public: { text: 'Бесплатно', color: 'success', icon: '🆓' },
        registered: { text: 'Для участников', color: 'primary', icon: '👥' },
        token: { text: 'По приглашению', color: 'warning', icon: '🔗' }
    }), []);

    const difficultyBadgeConfig = useMemo(() => ({
        beginner: { text: 'Начинающий', color: 'success' },
        intermediate: { text: 'Средний', color: 'warning' },
        advanced: { text: 'Продвинутый', color: 'error' }
    }), []);

    if (type === 'access') {
        const badge = accessBadgeConfig[difficulty] || accessBadgeConfig.public;
        return (
            <Chip
                size="small"
                color={badge.color}
                label={
                    <Box display="flex" alignItems="center">
                        <Box mr={0.5} component="span" aria-hidden="true">{badge.icon}</Box> {badge.text}
                    </Box>
                }
                sx={{ height: 24 }}
            />
        );
    } else if (type === 'difficulty') {
        const badge = difficultyBadgeConfig[difficulty] || difficultyBadgeConfig.beginner;
        return (
            <Chip
                size="small"
                color={badge.color}
                label={badge.text}
                sx={{ height: 24 }}
            />
        );
    }

    return null;
});

// CourseCard component - for Continue Learning section
const LearningCourseCard = memo(({ course, onCourseSelect }) => {
    const progress = Math.floor(Math.random() * 80) + 10;
    const difficulty = ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)];

    return (
        <Paper
            elevation={2}
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                transition: 'all 0.3s',
                '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-4px)'
                },
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={() => onCourseSelect && onCourseSelect('course-detail', { course })}
            role="button"
            aria-label={`Продолжить изучение курса ${course.title}, выполнено ${progress}%`}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCourseSelect && onCourseSelect('course-detail', { course });
                }
            }}
        >
            <Box
                sx={{
                    height: 180,
                    position: 'relative',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="white">Прогресс</Typography>
                        <Typography variant="caption" color="white">{progress}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: 'white'
                            }
                        }}
                    />
                </Box>
            </Box>
            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        color="text.primary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: 'primary.main'
                            }
                        }}
                    >
                        {course.title}
                    </Typography>
                    <CourseBadge type="access" difficulty={course.access_type} />
                </Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1
                    }}
                >
                    {course.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <CourseBadge type="difficulty" difficulty={difficulty} />
                    <Typography variant="caption" color="text.secondary">⏱️ ~45 мин</Typography>
                </Box>
                <Button
                    variant="primary"
                    fullWidth
                >
                    Продолжить изучение
                </Button>
            </Box>
        </Paper>
    );
});

// Popular course card component
const PopularCourseCard = memo(({ course, index, onCourseSelect }) => {
    const studentCount = Math.floor(Math.random() * 2000) + 500;
    const rating = (4.0 + Math.random()).toFixed(1);

    return (
        <div
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
            onClick={() => onCourseSelect && onCourseSelect('course-detail', { course })}
            role="button"
            aria-label={`Открыть популярный курс: ${course.title}`}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCourseSelect && onCourseSelect('course-detail', { course });
                }
            }}
        >
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-2xl text-white" aria-hidden="true">🔥</span>
                    </div>
                    {index === 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            #1
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {course.title}
                        </h3>
                        <CourseBadge type="access" difficulty={course.access_type} />
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-500">
                            <span aria-label={`${studentCount} студентов`}>👥 {studentCount.toLocaleString()}</span>
                            <span aria-label={`Рейтинг: ${rating} из 5`}>{'\u2B50'} {rating}</span>
                            <span aria-label={`Создан: ${new Date(course.created_at).toLocaleDateString()}`}>
                                📅 {new Date(course.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});


// Main Dashboard component
function Dashboard({ user, onCourseSelect }) {
    const [stats, setStats] = useState({
        totalCourses: 0,
        enrolledCourses: 0,
        completedCourses: 0,
        completedQuizzes: 0,
        averageScore: 0,
        studyStreak: 0,
        monthlyGoal: 10,
        monthlyProgress: 0
    });
    const [recentCourses, setRecentCourses] = useState([]);
    const [popularCourses, setPopularCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [coursesResponse, categoriesResponse] = await Promise.all([
                lessonsAPI.getAll(),
                categoriesAPI.getAll()
            ]);

            const courses = coursesResponse.data || [];
            setRecentCourses(courses.slice(0, 6));
            setPopularCourses(courses.slice(0, 4));
            setRecommendedCourses(courses.slice(2, 6));
            setCategories(categoriesResponse.data || []);

            // Enhanced mock stats with more realistic data
            const enrolledCount = user ? Math.floor(courses.length * 0.4) : 0;
            const completedCount = user ? Math.floor(enrolledCount * 0.6) : 0;

            setStats({
                totalCourses: courses.length,
                enrolledCourses: enrolledCount,
                completedCourses: completedCount,
                completedQuizzes: user ? Math.floor(completedCount * 1.5) : 0,
                averageScore: user ? Math.floor(75 + Math.random() * 20) : 0,
                studyStreak: user ? Math.floor(Math.random() * 15) + 1 : 0,
                monthlyGoal: 10,
                monthlyProgress: user ? Math.floor(Math.random() * 8) + 1 : 0
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Here you could set an error state and display it to the user
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initialize data and set greeting based on time of day
    useEffect(() => {
        fetchDashboardData();

        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Доброе утро');
        else if (hour < 17) setGreeting('Добрый день');
        else setGreeting('Добрый вечер');
    }, [fetchDashboardData]);

    if (loading) {
        return <DashboardLoading />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <HeroSection user={user} greeting={greeting} stats={stats} />

        </div>
    );
}

export default memo(Dashboard);