import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { categoriesAPI, quizAPI } from '../services/api';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    AlertTitle,
    Tabs,
    Tab,
    TextField,
    Paper,
    Avatar,
    Grid,
    LinearProgress,
    Breadcrumbs,
    Link,
    Stack
} from '@mui/material';
import {
    BookmarkBorder as BookmarkIcon,
    PlayArrow as PlayArrowIcon,
    CheckCircle as CheckCircleIcon,
    StarRate as StarRateIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    StarHalf as StarHalfIcon,
    NoteAdd as NoteAddIcon,
    Assignment as AssignmentIcon,
    Person as PersonIcon,
    CalendarToday as CalendarTodayIcon,
    AccessTime as AccessTimeIcon,
    Group as GroupIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';
import Quiz from './Quiz';

const CourseHeader = memo(({ course, category, accessBadge, formatDate, onNavigate }) => {
    return (
        <Card sx={{ mb: 3, width: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {category && (
                                <Chip
                                    label={category.title}
                                    size="small"
                                    color="primary"
                                    sx={{ mr: 1, fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                            )}
                            <Chip
                                label={accessBadge.text}
                                size="small"
                                color={accessBadge.color}
                                icon={accessBadge.icon}
                            />
                        </Box>

                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {course.title}
                        </Typography>

                        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem' }}>
                            {course.description}
                        </Typography>

                        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Создан: {formatDate(course.created_at)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Продолжительность: ~30 мин
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <GroupIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {Math.floor(Math.random() * 500) + 100} студентов
                                </Typography>
                            </Box>

                            <CourseRating rating={(4.0 + Math.random() * 0.9).toFixed(1)} />
                        </Stack>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
});

const CourseRating = memo(({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {[...Array(5)].map((_, i) => {
                if (i < fullStars) {
                    return <StarIcon key={i} fontSize="small" sx={{ color: 'warning.main' }} />;
                } else if (i === fullStars && hasHalfStar) {
                    return <StarHalfIcon key={i} fontSize="small" sx={{ color: 'warning.main' }} />;
                } else {
                    return <StarBorderIcon key={i} fontSize="small" sx={{ color: 'warning.main' }} />;
                }
            })}
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                {rating}
            </Typography>
        </Box>
    );
});

const CourseProgress = memo(({ course, progress, user }) => {
    if (!user) return null;

    return (
        <Box sx={{ ml: { xs: 0, lg: 2 }, mt: { xs: 2, lg: 0 }, minWidth: 250 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Прогресс изучения</Typography>
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress.completionPercentage}
                            sx={{ height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                            {progress.completionPercentage}% завершено
                        </Typography>
                    </Box>
                    <Stack spacing={1}>
                        {course.video && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {progress.videoWatched ? (
                                    <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                                ) : (
                                    <CheckCircleIcon fontSize="small" color="disabled" sx={{ mr: 1 }} />
                                )}
                                <Typography
                                    variant="body2"
                                    color={progress.videoWatched ? 'success.main' : 'text.secondary'}
                                >
                                    Видео просмотрено
                                </Typography>
                            </Box>
                        )}
                        {progress.totalQuizzes > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {progress.quizzesCompleted === progress.totalQuizzes ? (
                                    <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                                ) : (
                                    <CheckCircleIcon fontSize="small" color="disabled" sx={{ mr: 1 }} />
                                )}
                                <Typography
                                    variant="body2"
                                    color={progress.quizzesCompleted === progress.totalQuizzes ? 'success.main' : 'text.secondary'}
                                >
                                    Тесты пройдены ({progress.quizzesCompleted}/{progress.totalQuizzes})
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {progress.completionPercentage === 100 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                startIcon={<CheckCircleIcon />}
                            >
                                Получить сертификат
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
});

const TabContent = memo(({
    currentTab,
    course,
    quizzes,
    handleQuizComplete,
    handleVideoProgress,
    learningOutcomes,
    setCurrentTab,
    formatDate
}) => {
    switch (currentTab) {
        case 0:
            return <CourseOverview
                course={course}
                quizzes={quizzes}
                learningOutcomes={learningOutcomes}
                setCurrentTab={setCurrentTab}
                formatDate={formatDate}
            />;
        case 1:
            return course.video ?
                <VideoTabContent
                    course={course}
                    handleVideoProgress={handleVideoProgress}
                /> : null;
        case 2:
            return <QuizTabContent
                course={course}
                quizzes={quizzes}
                handleQuizComplete={handleQuizComplete}
                setCurrentTab={setCurrentTab}
            />;
        case 3:
            return <MaterialsTabContent />;
        default:
            return null;
    }
});

const CourseOverview = memo(({ course, quizzes, learningOutcomes, setCurrentTab, formatDate }) => {
    return (
        <Stack spacing={4}>
            <Box>
                <Typography variant="h6" gutterBottom>О курсе</Typography>
                <Typography variant="body1">
                    {course.description}
                </Typography>
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>Что вы изучите</Typography>
                <Grid container spacing={2}>
                    {learningOutcomes.map((outcome, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.3, fontSize: 20 }} />
                                <Typography variant="body1">{outcome}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>Структура курса</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                <PlayArrowIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="medium">Основное видео</Typography>
                                <Typography variant="body2" color="text.secondary">Продолжительность: ~30 минут</Typography>
                            </Box>
                        </Box>
                        {course.video && (
                            <Button
                                variant="contained"
                                startIcon={<PlayArrowIcon />}
                                size="small"
                                onClick={() => setCurrentTab(1)}
                            >
                                Смотреть
                            </Button>
                        )}
                    </Box>
                </Paper>

                {quizzes.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
                                    <AssignmentIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="medium">Тесты для проверки знаний</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {quizzes.length} {quizzes.length === 1 ? 'тест' : 'тестов'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<AssignmentIcon />}
                                size="small"
                                onClick={() => setCurrentTab(2)}
                            >
                                Пройти тесты
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>Об авторе</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {course.owner && course.owner.username ? course.owner.username.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1">
                            {course.owner ? course.owner.username || 'Администратор' : 'Администратор'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Эксперт в области образования
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Stack>
    );
});

const VideoTabContent = memo(({ course, handleVideoProgress }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Видеоматериал</Typography>
            <VideoPlayer
                videoUrl={course.video}
                lesson={course}
                onProgress={handleVideoProgress}
            />

            <Paper sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>Мои заметки</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Добавьте свои заметки здесь..."
                    variant="outlined"
                    margin="normal"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="contained" color="primary" startIcon={<NoteAddIcon />}>
                        Сохранить заметки
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
});

const QuizTabContent = memo(({ course, quizzes, handleQuizComplete, setCurrentTab }) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Проверка знаний</Typography>

            {quizzes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📝</Typography>
                    <Typography variant="h5" gutterBottom>Тесты не найдены</Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        К этому курсу пока не добавлены тесты для проверки знаний
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setCurrentTab(0)}
                    >
                        Вернуться к обзору
                    </Button>
                </Paper>
            ) : (
                <Quiz
                    lesson={course}
                    onComplete={handleQuizComplete}
                />
            )}
        </Box>
    );
});

const MaterialsTabContent = memo(() => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Дополнительные материалы</Typography>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>📚</Typography>
                <Typography variant="h5" gutterBottom>Скоро!</Typography>
                <Typography variant="body1" paragraph>
                    Здесь будут размещены презентации, статьи и дополнительные материалы по курсу
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Следите за обновлениями
                </Typography>
            </Paper>
        </Box>
    );
});

function CourseDetail({ course, user, onNavigate }) {
    const [category, setCategory] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({
        videoWatched: false,
        quizzesCompleted: 0,
        totalQuizzes: 0,
        completionPercentage: 0
    });

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    const accessBadge = useMemo(() => {
        const badges = {
            public: {
                text: 'Бесплатно',
                color: 'success',
                icon: <BookmarkIcon fontSize="small" />
            },
            registered: {
                text: 'Для зарегистрированных',
                color: 'info',
                icon: <BookmarkIcon fontSize="small" />
            },
            token: {
                text: 'По ссылке',
                color: 'warning',
                icon: <BookmarkIcon fontSize="small" />
            }
        };
        return course && course.access_type ? badges[course.access_type] || badges.public : badges.public;
    }, [course]);

    const calculateCompletionPercentage = useCallback((videoWatched, quizzesCompleted, totalQuizzes) => {
        if (!course) return 0;
        if (totalQuizzes === 0 && !course.video) return 100;
        if (totalQuizzes === 0 && course.video) {
            return videoWatched ? 100 : 0;
        }
        if (totalQuizzes > 0 && !course.video) {
            return Math.round((quizzesCompleted / totalQuizzes) * 100);
        }

        let percentage = 0;
        if (videoWatched) percentage += 50;
        if (totalQuizzes > 0) {
            percentage += Math.round((quizzesCompleted / totalQuizzes) * 50);
        }

        return percentage;
    }, [course]);

    const fetchCourseDetails = useCallback(async () => {
        if (!course) {
            setLoading(false);
            setError('Курс не найден. Пожалуйста, вернитесь к списку курсов.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const fetchPromises = [
                course.category ? categoriesAPI.getById(course.category) : Promise.resolve(null)
            ];

            try {
                fetchPromises.push(quizAPI.getByLessonId(course.id));
            } catch (err) {
                console.log('No quizzes available for this course');
            }

            const [categoryResponse, quizzesResponse] = await Promise.all(
                fetchPromises.map(p => p.catch(e => null))
            );

            if (categoryResponse) {
                setCategory(categoryResponse.data);
            }

            if (quizzesResponse) {
                const quizData = Array.isArray(quizzesResponse.data)
                    ? quizzesResponse.data
                    : [quizzesResponse.data];

                setQuizzes(quizData);

                setProgress(prev => ({
                    ...prev,
                    totalQuizzes: quizData.length,
                    completionPercentage: calculateCompletionPercentage(
                        prev.videoWatched,
                        prev.quizzesCompleted,
                        quizData.length
                    )
                }));
            } else {
                setQuizzes([]);
                setProgress(prev => ({
                    ...prev,
                    totalQuizzes: 0,
                    completionPercentage: prev.videoWatched ? 100 : 0
                }));
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError('Произошла ошибка при загрузке данных курса. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    }, [course, calculateCompletionPercentage]);

    useEffect(() => {
        fetchCourseDetails();
    }, [fetchCourseDetails]);

    const handleQuizComplete = useCallback(() => {
        setProgress(prev => {
            const newCompleted = Math.min(prev.quizzesCompleted + 1, prev.totalQuizzes);
            return {
                ...prev,
                quizzesCompleted: newCompleted,
                completionPercentage: calculateCompletionPercentage(
                    prev.videoWatched,
                    newCompleted,
                    prev.totalQuizzes
                )
            };
        });

        setTimeout(() => {
            fetchCourseDetails();
        }, 1000);
    }, [fetchCourseDetails, calculateCompletionPercentage]);

    const handleVideoProgress = useCallback(() => {
        setProgress(prev => ({
            ...prev,
            videoWatched: true,
            completionPercentage: calculateCompletionPercentage(
                true,
                prev.quizzesCompleted,
                prev.totalQuizzes
            )
        }));
    }, [calculateCompletionPercentage]);

    const tabs = useMemo(() => [
        { label: 'Обзор', icon: <BookmarkIcon /> },
        { label: 'Видео', icon: <PlayArrowIcon />, disabled: !course?.video },
        { label: `Тесты (${quizzes.length})`, icon: <AssignmentIcon /> },
        { label: 'Материалы', icon: <BookmarkIcon /> }
    ], [course, quizzes.length]);

    const learningOutcomes = useMemo(() => {
        const outcomes = [
            "Понимание основных концепций и принципов",
            "Приобретение практических навыков для решения задач",
            "Работа с реальными примерами и кейсами"
        ];

        if (quizzes.length > 0) {
            outcomes.push("Проверка усвоения материала через тестирование");
        }

        return outcomes;
    }, [quizzes.length]);

    const handleTabChange = useCallback((event, newValue) => {
        setCurrentTab(newValue);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Загрузка курса...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" onClick={fetchCourseDetails}>Попробовать снова</Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 'lg', mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 3 }}
                aria-label="breadcrumb"
            >
                <Link
                    color="inherit"
                    component="button"
                    variant="body2"
                    onClick={() => onNavigate('dashboard')}
                    underline="hover"
                >
                    Главная
                </Link>
                <Link
                    color="inherit"
                    component="button"
                    variant="body2"
                    onClick={() => onNavigate('courses')}
                    underline="hover"
                >
                    Курсы
                </Link>
                <Typography color="text.primary" variant="body2">{course.title}</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, width: '100%' }}>
                <CourseHeader
                    course={course}
                    category={category}
                    accessBadge={accessBadge}
                    formatDate={formatDate}
                    onNavigate={onNavigate}
                />

                <CourseProgress
                    course={course}
                    progress={progress}
                    user={user}
                />
            </Box>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label="course navigation tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                label={tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                                disabled={tab.disabled}
                            />
                        ))}
                    </Tabs>
                </Box>
                <Box sx={{ p: 3 }}>
                    <TabContent
                        currentTab={currentTab}
                        course={course}
                        quizzes={quizzes}
                        handleQuizComplete={handleQuizComplete}
                        handleVideoProgress={handleVideoProgress}
                        learningOutcomes={learningOutcomes}
                        setCurrentTab={setCurrentTab}
                        formatDate={formatDate}
                    />
                </Box>
            </Card>
        </Box>
    );
}

export default CourseDetail;