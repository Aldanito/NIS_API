import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Paper, Typography, Grid, Button, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import './App.css';
import Auth from './components/Auth';
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail';
import CourseCreate from './components/CourseCreate';
import FileUpload from './components/FileUpload';
import VideoPlayer from './components/VideoPlayer';
import Quiz from './components/Quiz';
import QuizCreator from './components/QuizCreator';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const { user, login, logout } = useAuth();
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [refreshLessons, setRefreshLessons] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const getActiveViewFromPath = (path) => {
    const pathSegments = path.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'dashboard';
    if (pathSegments[0] === 'courses' && pathSegments.length === 1) return 'courses';
    if (pathSegments[0] === 'courses' && pathSegments.length > 1) return 'course-detail';
    if (pathSegments[0] === 'upload') return 'upload';
    if (pathSegments[0] === 'lesson') return 'lesson';
    if (pathSegments[0] === 'quiz-creator') return 'create-quiz';
    if (pathSegments[0] === 'course-create') return 'create-course';
    return 'dashboard';
  };

  const activeView = getActiveViewFromPath(location.pathname);

  useEffect(() => {
  }, []);

  const handleLogin = (authData) => {
    login(authData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCourseSelect = (course) => {
    if (course && course.id) {
      setSelectedCourse(course);
      setCurrentLesson(course);
      navigate(`/courses/${course.id}`);
    } else {
      console.error('Invalid course data received:', course);
      if (typeof course === 'string') {
        navigate(`/${course}`);
      }
    }
  };

  const handleLessonCreated = () => {
    setRefreshLessons(prev => prev + 1);
    navigate('/courses');
  };

  const handleQuizCreated = () => {
    setRefreshLessons(prev => prev + 1);
  };

  const handleNavigate = (path, data = null) => {
    if (data) {
      if (path === 'course-detail' && data.course) {
        setSelectedCourse(data.course);
        setCurrentLesson(data.course);
        navigate(`/courses/${data.course.id}`);
      } else if (path === 'lesson') {
        if (data.videoUrl) {
          setCurrentVideoUrl(data.videoUrl);
        }
        if (data.lesson) {
          setCurrentLesson(data.lesson);
          navigate(`/lesson/${data.lesson.id}`);
        }
      } else if (path === 'quiz-creator') {
        navigate(`/quiz-creator/${data.lesson?.id || ''}`);
      } else {
        navigate(`/${path}`);
      }
    } else {
      const routeMap = {
        'create-quiz': 'quiz-creator',
        'create-course': 'course-create',
      };

      const routePath = routeMap[path] || path;
      navigate(`/${routePath}`);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const LandingPage = () => (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #1a237e, #4a148c, #311b92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2
            }}
          >
            NIS <Box
              component="span"
              sx={{
                background: 'linear-gradient(to right, #4fc3f7, #b388ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Learning
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'grey.300',
              mb: 4,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Современная платформа онлайн-обучения с интерактивными курсами, квизами и прогрессом в реальном времени
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Auth onLogin={handleLogin} />
          </Grid>

          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    p: 1.5,
                    mt: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'white', mb: 1 }}>
                    Видеоуроки HD качества
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'grey.300' }}>
                    Просматривайте курсы в высоком качестве с адаптивным плеером
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'secondary.main',
                    borderRadius: '50%',
                    p: 1.5,
                    mt: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'white', mb: 1 }}>
                    Интерактивные квизы
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'grey.300' }}>
                    Проверяйте знания с помощью тестов и получайте мгновенную обратную связь
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    p: 1.5,
                    mt: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'white', mb: 1 }}>
                    Отслеживание прогресса
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'grey.300' }}>
                    Следите за своими достижениями и статистикой обучения
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Доступные курсы
          </Typography>
          <CourseList
            onCourseSelect={handleCourseSelect}
            user={user}
            key={refreshLessons}
            previewMode={true}
            maxCourses={6}
          />
        </Box>
      </Container>
    </Box>
  );

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            activeView={activeView}
            onNavigate={handleNavigate}
            userProgress={{
              enrolledCourses: 0,
              completedCourses: 0,
              completedVideos: 0,
              completedQuizzes: 0,
              totalProgress: 0
            }}
            isCollapsed={!sidebarOpen || isMobile}
            onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
          />

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              transition: theme => theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              ml: {
                xs: 0,
                md: sidebarOpen ? 0 : '-180px'
              }
            }}
          >
            <Header
              user={user}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />

            <Box
              component="main"
              sx={{
                flex: 1,
                overflowY: 'auto',
                bgcolor: 'background.default',
                p: { xs: 2, md: 3 }
              }}
            >
              <Container maxWidth="xl">
                <Routes>
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard user={user} onNavigate={handleNavigate} />
                    </ProtectedRoute>
                  } />
                  <Route path="/courses" element={
                    <ProtectedRoute>
                      <CourseList
                        onCourseSelect={handleCourseSelect}
                        user={user}
                        key={refreshLessons}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path="/courses/:courseId" element={
                    <ProtectedRoute>
                      <CourseDetail
                        course={selectedCourse}
                        user={user}
                        onNavigate={handleNavigate}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path="/upload" element={
                    <ProtectedRoute>
                      <FileUpload
                        user={user}
                        onLessonCreated={handleLessonCreated}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path="/lesson/:lessonId" element={
                    <ProtectedRoute>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {currentVideoUrl && (
                          <VideoPlayer videoUrl={currentVideoUrl} lesson={currentLesson} />
                        )}
                        {currentLesson && (
                          <Quiz lesson={currentLesson} user={user} />
                        )}
                      </Box>
                    </ProtectedRoute>
                  } />
                  <Route path="/quiz-creator/:lessonId?" element={
                    <ProtectedRoute>
                      <QuizCreator
                        lesson={currentLesson}
                        user={user}
                        onQuizCreated={handleQuizCreated}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path="/course-create" element={
                    <ProtectedRoute>
                      <CourseCreate
                        user={user}
                        onCourseCreated={handleLessonCreated}
                      />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Container>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
