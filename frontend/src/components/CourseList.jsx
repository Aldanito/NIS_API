import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { lessonsAPI, categoriesAPI } from '../services/api';
import TokenAccess from './TokenAccess';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Grid,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Chip,
    Divider,
    Paper,
    Container,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Rating,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    AccessTime as AccessTimeIcon,
    CalendarToday as CalendarTodayIcon,
    PlayArrow as PlayArrowIcon,
    Lock as LockIcon,
    VpnKey as VpnKeyIcon,
    Warning as WarningIcon,
    Public as PublicIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

/**

 * @param {Object} props - Component props
 * @param {Object} props.user - Current user data
 * @param {Function} props.onCourseSelect - Handler for course selection
 * @param {Object} props.initialFilters - Initial filter values
 * @param {Boolean} props.previewMode - Whether to show a limited preview of courses
 * @param {Number} props.maxCourses - Maximum number of courses to display in preview mode
 */
function CourseList({
    user,
    onCourseSelect,
    initialFilters = {},
    previewMode = false,
    maxCourses = 6
}) {
    // Core state
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [accessFilter, setAccessFilter] = useState('all');
    const [showTokenAccess, setShowTokenAccess] = useState(null);
    const [activeFilters, setActiveFilters] = useState(0);

    const theme = useTheme();

    const filterAndSortCourses = useCallback(() => {
        if (!courses.length) return;

        let filtered = [...courses];
        let filterCount = 0;


        if (selectedCategory) {
            filtered = filtered.filter(course => course.category === parseInt(selectedCategory));
            filterCount++;
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(course =>
                course.title?.toLowerCase().includes(term) ||
                course.description?.toLowerCase().includes(term)
            );
            filterCount++;
        }

        if (accessFilter !== 'all') {
            filtered = filtered.filter(course => course.access_type === accessFilter);
            filterCount++;
        }

        setActiveFilters(filterCount);

        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'alphabetical':
                filtered.sort((a, b) => a.title?.localeCompare(b.title));
                break;
            default:
                break;
        }

        if (previewMode && maxCourses && filtered.length > maxCourses) {
            filtered = filtered.slice(0, maxCourses);
        }

        setFilteredCourses(filtered);
    }, [courses, selectedCategory, searchTerm, sortBy, accessFilter, previewMode, maxCourses]);

    /**
     * Fetch required data from API
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [coursesResponse, categoriesResponse] = await Promise.all([
                lessonsAPI.getAll(),
                categoriesAPI.getAll()
            ]);

            setCourses(coursesResponse.data);
            setCategories(categoriesResponse.data);
        } catch (err) {
            console.error('Error fetching course data:', err);
            setError('Не удалось загрузить курсы. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        filterAndSortCourses();
    }, [filterAndSortCourses]);


    const handleResetFilters = () => {
        setSelectedCategory('');
        setSearchTerm('');
        setAccessFilter('all');
        setSortBy('newest');
    };


    const getAccessConfig = useCallback((accessType) => {
        const configs = {
            public: {
                text: 'Бесплатно',
                color: 'success',
                icon: <PublicIcon fontSize="small" />,
                bgcolor: alpha(theme.palette.success.main, 0.1),
            },
            registered: {
                text: 'Для зарегистрированных',
                color: 'info',
                icon: <LockIcon fontSize="small" />,
                bgcolor: alpha(theme.palette.info.main, 0.1),
            },
            token: {
                text: 'По ссылке',
                color: 'warning',
                icon: <VpnKeyIcon fontSize="small" />,
                bgcolor: alpha(theme.palette.warning.main, 0.1),
            }
        };
        return configs[accessType] || configs.public;
    }, [theme]);


    const canAccessCourse = useCallback((course) => {
        if (course?.access_type === 'public') return true;
        if (course?.access_type === 'registered' && user) return true;
        return false;
    }, [user]);


    const handleCourseClick = useCallback((course) => {
        if (canAccessCourse(course)) {
            if (course && course.id) {
                onCourseSelect(course);
            } else {
                console.error('Invalid course data:', course);
            }
        } else if (course.access_type === 'token') {
            setShowTokenAccess(course);
        } else {
            onCourseSelect('auth');
        }
    }, [canAccessCourse, onCourseSelect]);


    const handleTokenAccessGranted = useCallback((courseData) => {
        setShowTokenAccess(null);
        if (courseData && onCourseSelect) {
            onCourseSelect(courseData);
        }
    }, [onCourseSelect]);


    const categoryOptions = useMemo(() => {
        return [
            { value: '', label: 'Все категории' },
            ...categories.map(category => ({
                value: category.id.toString(),
                label: category.title
            }))
        ];
    }, [categories]);


    const accessOptions = useMemo(() => [
        { value: 'all', label: 'Все типы доступа' },
        { value: 'public', label: 'Бесплатные' },
        { value: 'registered', label: 'Для зарегистрированных' },
        { value: 'token', label: 'По ссылке' }
    ], []);


    const sortOptions = useMemo(() => [
        { value: 'newest', label: 'Сначала новые' },
        { value: 'oldest', label: 'Сначала старые' },
        { value: 'alphabetical', label: 'По алфавиту' }
    ], []);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }, []);


    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 300
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }


    if (error) {
        return (
            <Paper
                elevation={previewMode ? 0 : 2}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: previewMode ? 'transparent' : 'background.paper',
                    color: previewMode ? 'white' : 'text.primary',
                    border: previewMode ? 'none' : `1px solid ${theme.palette.divider}`
                }}
            >
                <WarningIcon sx={{ fontSize: 60, color: previewMode ? 'white' : 'warning.main', mb: 2 }} />
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'medium' }}>
                    Что-то пошло не так
                </Typography>
                <Typography sx={{ mb: 4, color: previewMode ? 'grey.300' : 'text.secondary' }}>
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchData}
                    startIcon={<RefreshIcon />}
                    color={previewMode ? 'secondary' : 'primary'}
                >
                    Попробовать снова
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            {!previewMode && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Каталог курсов
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Изучайте новые навыки с лучшими онлайн-курсами в области программирования, дизайна и бизнеса
                    </Typography>
                </Box>
            )}

            {!previewMode && (
                <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
                    <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6">Фильтры и поиск</Typography>
                            </Box>
                            {activeFilters > 0 && (
                                <Button
                                    size="small"
                                    onClick={handleResetFilters}
                                    startIcon={<RefreshIcon />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Сбросить фильтры ({activeFilters})
                                </Button>
                            )}
                        </Box>

                        <Grid container spacing={3}>
                            {/* Search Input */}
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Поиск курса"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Введите название или описание"
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Category Filter */}
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="category-select-label">Категория</InputLabel>
                                    <Select
                                        labelId="category-select-label"
                                        id="category-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        label="Категория"
                                    >
                                        {categoryOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Access Filter */}
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="access-select-label">Тип доступа</InputLabel>
                                    <Select
                                        labelId="access-select-label"
                                        id="access-select"
                                        value={accessFilter}
                                        onChange={(e) => setAccessFilter(e.target.value)}
                                        label="Тип доступа"
                                    >
                                        {accessOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Sort Options */}
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="sort-select-label">Сортировка</InputLabel>
                                    <Select
                                        labelId="sort-select-label"
                                        id="sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        label="Сортировка"
                                    >
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Results count */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            bgcolor: 'grey.50',
                            borderTop: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Найдено курсов: <Typography component="span" fontWeight="medium">{filteredCourses.length}</Typography>
                        </Typography>
                        {courses.length > filteredCourses.length && (
                            <Typography variant="body2" color="text.secondary">
                                Показано {filteredCourses.length} из {courses.length}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            )}

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <Paper
                    elevation={previewMode ? 0 : 2}
                    sx={{
                        py: 6,
                        px: 4,
                        textAlign: 'center',
                        bgcolor: previewMode ? 'transparent' : 'background.paper',
                        color: previewMode ? 'white' : 'text.primary',
                        border: previewMode ? 'none' : `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📚</Typography>
                    <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'medium' }}>
                        Курсы не найдены
                    </Typography>
                    <Typography sx={{ mb: 4, color: previewMode ? 'grey.300' : 'text.secondary' }}>
                        По вашему запросу не найдено ни одного курса
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleResetFilters}
                        color={previewMode ? 'secondary' : 'primary'}
                    >
                        Сбросить все фильтры
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredCourses.map((course) => {
                        const accessConfig = getAccessConfig(course.access_type);
                        const categoryName = categories.find(cat => cat.id === course.category)?.title || 'Без категории';
                        const isAccessible = canAccessCourse(course);
                        // Generate random rating for demo purposes
                        const rating = (4.0 + Math.random() * 0.9).toFixed(1);

                        return (
                            <Grid item xs={12} sm={6} md={previewMode ? 4 : 4} lg={previewMode ? 4 : 3} key={course.id}>
                                <Card
                                    elevation={previewMode ? 0 : 2}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: theme.shadows[6],
                                            '& .MuiCardMedia-root': {
                                                opacity: 0.9
                                            }
                                        },
                                        bgcolor: previewMode ? alpha(theme.palette.background.paper, 0.8) : 'background.paper',
                                    }}
                                >
                                    {/* Course Header/Image */}
                                    <CardMedia
                                        component="div"
                                        sx={{
                                            height: 180,
                                            bgcolor: `${theme.palette.primary.dark}`,
                                            backgroundSize: 'cover',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            transition: 'opacity 0.2s ease-in-out',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleCourseClick(course)}
                                    >
                                        <Typography variant="h1" sx={{ color: 'white', fontSize: '3rem' }}>🎥</Typography>

                                        {/* Access Badge */}
                                        <Chip
                                            icon={accessConfig.icon}
                                            label={accessConfig.text}
                                            size="small"
                                            color={accessConfig.color}
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                bgcolor: accessConfig.bgcolor,
                                                borderColor: theme.palette[accessConfig.color].main,
                                                border: 1,
                                                fontWeight: 'medium',
                                                '& .MuiChip-icon': { color: theme.palette[accessConfig.color].main }
                                            }}
                                        />
                                    </CardMedia>

                                    {/* Course Info */}
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Chip
                                            label={categoryName}
                                            size="small"
                                            sx={{
                                                alignSelf: 'flex-start',
                                                mb: 1.5,
                                                fontSize: '0.75rem',
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                                fontWeight: 'medium'
                                            }}
                                        />

                                        <Typography
                                            variant="h6"
                                            component="h3"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 'medium',
                                                cursor: 'pointer',
                                                transition: 'color 0.15s ease-in-out',
                                                '&:hover': { color: 'primary.main' },
                                                height: '3rem',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                textOverflow: 'ellipsis'
                                            }}
                                            onClick={() => handleCourseClick(course)}
                                        >
                                            {course.title}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                            sx={{
                                                mb: 2,
                                                flexGrow: 1,
                                                height: '3rem',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {course.description}
                                        </Typography>

                                        {/* Course Metadata */}
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1,
                                            mt: 'auto'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                <CalendarTodayIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                                                <Typography variant="caption">
                                                    {formatDate(course.created_at)}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                <AccessTimeIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                                                <Typography variant="caption">~30 мин</Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <Rating value={parseFloat(rating)} precision={0.1} size="small" readOnly />
                                            <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                                                {rating}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    {/* Course Actions */}
                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        {isAccessible ? (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleCourseClick(course)}
                                                fullWidth
                                                startIcon={<PlayArrowIcon />}
                                                sx={{ borderRadius: 8 }}
                                            >
                                                Начать обучение
                                            </Button>
                                        ) : course.access_type === 'token' ? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleCourseClick(course)}
                                                fullWidth
                                                startIcon={<VpnKeyIcon />}
                                                color="warning"
                                                sx={{ borderRadius: 8 }}
                                            >
                                                Ввести токен
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleCourseClick(course)}
                                                fullWidth
                                                startIcon={<LockIcon />}
                                                color="secondary"
                                                sx={{ borderRadius: 8 }}
                                            >
                                                Требуется вход
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Show more button in preview mode */}
            {previewMode && courses.length > maxCourses && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => onCourseSelect('courses')}
                        sx={{ borderRadius: 8, color: 'white', borderColor: 'white' }}
                    >
                        Смотреть все курсы ({courses.length})
                    </Button>
                </Box>
            )}

            {/* Token Access Dialog */}
            <Dialog
                open={!!showTokenAccess}
                onClose={() => setShowTokenAccess(null)}
                aria-labelledby="token-access-dialog-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="token-access-dialog-title">
                    {showTokenAccess?.title || 'Доступ по токену'}
                </DialogTitle>
                <DialogContent>
                    {showTokenAccess && (
                        <TokenAccess
                            lesson={showTokenAccess}
                            onAccessGranted={handleTokenAccessGranted}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowTokenAccess(null)} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CourseList;