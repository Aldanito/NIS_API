import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Paper,
    CircularProgress,
    Alert,
    AlertTitle,
    Divider,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Stack
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Replay as ReplayIcon,
    Assessment as AssessmentIcon,
    QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Quiz({ lesson, onComplete }) {
    const { user } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchQuiz = useCallback(async () => {
        if (!lesson || !lesson.id) {
            return;
        }

        try {
            setLoading(true);
            const response = await quizAPI.getByLessonId(lesson.id);
            setQuiz(response.data);
            setError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Для этого урока нет квиза');
            } else {
                setError('Ошибка при загрузке квиза');
                console.error('Error fetching quiz:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [lesson]);

    const fetchAnalytics = useCallback(async () => {
        if (!lesson || !lesson.id) return;

        try {
            const response = await quizAPI.getAnalytics(lesson.id);
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    }, [lesson]);

    useEffect(() => {
        if (lesson && lesson.id) {
            fetchQuiz();
            fetchAnalytics();
        }
    }, [lesson, fetchQuiz, fetchAnalytics]);

    const handleAnswerChange = (questionId, answerId) => {
        setAnswers({
            ...answers,
            [questionId]: answerId
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Необходимо войти в систему для прохождения квиза');
            return;
        }

        if (!quiz || !quiz.questions) {
            setError('Квиз не загружен');
            return;
        }

        const unansweredQuestions = quiz.questions.filter(q => !answers[q.id]);
        if (unansweredQuestions.length > 0) {
            setError('Пожалуйста, ответьте на все вопросы');
            return;
        }

        try {
            const answerArray = Object.values(answers);

            setLoading(true);
            const response = await quizAPI.submit(lesson.id, answerArray);
            setScore(response.data.score);
            setSubmitted(true);
            setError('');

            fetchAnalytics();

            if (onComplete && typeof onComplete === 'function') {
                onComplete(response.data.score);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при отправке квиза');
            console.error('Error submitting quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetQuiz = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(null);
        setError('');
    };

    if (!lesson) {
        return null;
    }

    if (loading && !quiz) {
        return (
            <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    Квиз для {lesson.title || "урока"}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>Загрузка квиза...</Typography>
                </Box>
            </Paper>
        );
    }

    if (error && !quiz) {
        return (
            <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    Квиз для {lesson.title || "урока"}
                </Typography>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <AlertTitle>Внимание</AlertTitle>
                    {error}
                </Alert>
            </Paper>
        );
    }

    // Generate a color based on score
    const getScoreColor = (scoreValue) => {
        if (scoreValue >= 80) return 'success.main';
        if (scoreValue >= 60) return 'info.main';
        if (scoreValue >= 40) return 'warning.main';
        return 'error.main';
    };

    return (
        <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                {quiz && quiz.title ? `Квиз: ${quiz.title}` : `Квиз для ${lesson.title || "урока"}`}
            </Typography>

            {lesson && lesson.description && (
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    {lesson.description}
                </Typography>
            )}

            {/* Analytics Section */}
            {analytics && (
                <Paper
                    variant="outlined"
                    sx={{ mb: 4, p: 2, bgcolor: 'background.default' }}
                >
                    <Stack direction="row" alignItems="center" mb={1}>
                        <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Статистика</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Средний балл:
                                <Typography
                                    component="span"
                                    variant="body2"
                                    fontWeight="bold"
                                    color="primary.main"
                                    sx={{ ml: 1 }}
                                >
                                    {analytics.average_score}%
                                </Typography>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                                Всего попыток:
                                <Typography
                                    component="span"
                                    variant="body2"
                                    fontWeight="bold"
                                    color="primary.main"
                                    sx={{ ml: 1 }}
                                >
                                    {analytics.attempts_count}
                                </Typography>
                            </Typography>
                        </Grid>

                        {analytics.user_last_attempt && (
                            <Grid item xs={12}>
                                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Ваш последний результат:
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            fontWeight="bold"
                                            color={getScoreColor(analytics.user_last_attempt.score)}
                                            sx={{ ml: 1 }}
                                        >
                                            {analytics.user_last_attempt.score}%
                                        </Typography>
                                        {' '}({new Date(analytics.user_last_attempt.passed_at).toLocaleDateString()})
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            )}

            {submitted && score !== null ? (
                <Card sx={{ mb: 4, bgcolor: 'success.dark' }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <CheckCircleIcon color="success" />
                            <Typography variant="h6" color="white">Результат</Typography>
                        </Stack>

                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                            <CircularProgress
                                variant="determinate"
                                value={score}
                                size={80}
                                thickness={4}
                                sx={{
                                    color: getScoreColor(score),
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%'
                                }}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h5" component="div" color="white" fontWeight="bold">
                                    {score}%
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ReplayIcon />}
                            onClick={resetQuiz}
                            sx={{ mt: 2 }}
                        >
                            Пройти снова
                        </Button>
                    </CardContent>
                </Card>
            ) : quiz && quiz.questions ? (
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Stack spacing={3}>
                        {quiz.questions.map((question, index) => (
                            <Paper
                                key={question.id}
                                sx={{
                                    p: 3,
                                    bgcolor: 'background.default',
                                    borderLeft: answers[question.id] ? '4px solid' : 'none',
                                    borderLeftColor: 'primary.main'
                                }}
                                elevation={1}
                            >
                                <Stack direction="row" alignItems="flex-start" spacing={1} mb={2}>
                                    <QuestionAnswerIcon
                                        sx={{
                                            color: 'primary.main',
                                            mt: 0.5
                                        }}
                                    />
                                    <Typography variant="h6">
                                        {index + 1}. {question.text}
                                    </Typography>
                                </Stack>

                                <FormControl component="fieldset" sx={{ width: '100%', ml: 3.5 }}>
                                    <RadioGroup
                                        name={`question_${question.id}`}
                                        value={answers[question.id] || ''}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    >
                                        {question.answers.map((answer) => (
                                            <FormControlLabel
                                                key={answer.id}
                                                value={answer.id}
                                                control={<Radio />}
                                                label={answer.text}
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </Paper>
                        ))}
                    </Stack>

                    {error && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            <AlertTitle>Ошибка</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mt: 4 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={!user || loading}
                            fullWidth
                            sx={{ py: 1.5 }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                                    Отправка...
                                </>
                            ) : !user ? (
                                'Войдите для прохождения квиза'
                            ) : (
                                'Отправить ответы'
                            )}
                        </Button>
                    </Box>
                </Box>
            ) : null}
        </Paper>
    );
}

export default Quiz;