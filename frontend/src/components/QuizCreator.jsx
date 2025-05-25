import React, { useState, useEffect } from 'react';
import { quizAPI, lessonsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
// Material UI imports
import {
    Box,
    Typography,
    TextField,
    Button,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    Divider,
    IconButton,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

function QuizCreator({ lesson: initialLesson, onQuizCreated }) {
    const { user } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [lesson, setLesson] = useState(initialLesson || null);
    const [loading, setLoading] = useState(false);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        questions: [
            {
                text: '',
                answers: [
                    { text: '', is_correct: true },
                    { text: '', is_correct: false },
                    { text: '', is_correct: false },
                    { text: '', is_correct: false }
                ]
            }
        ]
    });


    useEffect(() => {
        const fetchData = async () => {
            setLoadingLessons(true);
            try {

                const lessonsResponse = await lessonsAPI.getAll();
                console.log('Fetched lessons:', lessonsResponse.data);
                setLessons(lessonsResponse.data);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Не удалось загрузить необходимые данные");
            } finally {
                setLoadingLessons(false);
            }
        };

        fetchData();
    }, []);

    const handleLessonSelect = (lessonId) => {

        setError('');
        setSuccess('');


        if (!lessonId || lessonId === "") {
            setLesson(null);
            return;
        }


        const parsedLessonId = parseInt(lessonId, 10);


        if (isNaN(parsedLessonId)) {
            console.error(`Invalid lesson ID: ${lessonId}`);
            setLesson(null);
            setError('Некорректный ID урока');
            return;
        }


        const selectedLesson = lessons.find(l => l.id === parsedLessonId);

        if (selectedLesson) {
            console.log(`Selected lesson: ${selectedLesson.id} - ${selectedLesson.title}`);
            setLesson(selectedLesson);

            if (error) setError('');
        } else {
            console.error(`No lesson found with ID: ${parsedLessonId}`);
            setLesson(null);
            setError(`Урок с ID ${parsedLessonId} не найден`);
        }
    };
    const handleTitleChange = (e) => {
        setFormData({ ...formData, title: e.target.value });
        if (error) setError('');
    };

    const handleQuestionChange = (questionIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].text = value;
        setFormData({ ...formData, questions: newQuestions });
        if (error) setError('');
    };

    const handleAnswerChange = (questionIndex, answerIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].answers[answerIndex].text = value;
        setFormData({ ...formData, questions: newQuestions });
        if (error) setError('');
    };

    const handleCorrectAnswerChange = (questionIndex, answerIndex) => {
        const newQuestions = [...formData.questions];

        newQuestions[questionIndex].answers.forEach(answer => answer.is_correct = false);

        newQuestions[questionIndex].answers[answerIndex].is_correct = true;
        setFormData({ ...formData, questions: newQuestions });
        if (error) setError('');
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    text: '',
                    answers: [
                        { text: '', is_correct: true },
                        { text: '', is_correct: false },
                        { text: '', is_correct: false },
                        { text: '', is_correct: false }
                    ]
                }
            ]
        });
        if (error) setError('');
    };

    const removeQuestion = (questionIndex) => {
        if (formData.questions.length > 1) {
            const newQuestions = formData.questions.filter((_, index) => index !== questionIndex);
            setFormData({ ...formData, questions: newQuestions });
            if (error) setError('');
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Необходимо указать название квиза');
            return false;
        }

        for (let i = 0; i < formData.questions.length; i++) {
            const question = formData.questions[i];

            if (!question.text.trim()) {
                setError(`Вопрос ${i + 1}: Необходимо указать текст вопроса`);
                return false;
            }

            const filledAnswers = question.answers.filter(a => a.text.trim());
            if (filledAnswers.length < 2) {
                setError(`Вопрос ${i + 1}: Необходимо указать минимум 2 варианта ответа`);
                return false;
            }

            const correctAnswers = question.answers.filter(a => a.is_correct && a.text.trim());
            if (correctAnswers.length !== 1) {
                setError(`Вопрос ${i + 1}: Необходимо выбрать один правильный ответ с текстом`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');


        if (!lesson) {
            setError('Необходимо выбрать урок для создания квиза');
            return;
        }


        const lessonId = lesson?.id;
        if (lessonId === undefined || lessonId === null) {
            setError(`Урок не содержит ID`);
            console.error(`Missing lesson ID: lesson object:`, lesson);
            return;
        }
        const parsedLessonId = typeof lessonId === 'string' ? parseInt(lessonId, 10) : lessonId;

        if (isNaN(parsedLessonId) || typeof parsedLessonId !== 'number') {
            setError(`Некорректный ID урока: ${lessonId}`);
            console.error(`Invalid lesson ID: ${lessonId}, type: ${typeof lessonId}`);
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {

            const cleanedQuestions = formData.questions.map(question => ({
                text: question.text.trim(),
                answers: question.answers
                    .filter(answer => answer.text.trim())
                    .map(answer => ({
                        text: answer.text.trim(),
                        is_correct: answer.is_correct
                    }))
            }));

            const quizData = {
                title: formData.title.trim(),
                questions: cleanedQuestions
            };

            const response = await quizAPI.create(parsedLessonId, quizData);

            setSuccess(`Квиз "${response.data.title || 'Новый квиз'}" успешно создан!`);


            if (onQuizCreated) {
                onQuizCreated(response.data);
            }


            setFormData({
                title: '',
                questions: [
                    {
                        text: '',
                        answers: [
                            { text: '', is_correct: true },
                            { text: '', is_correct: false },
                            { text: '', is_correct: false },
                            { text: '', is_correct: false }
                        ]
                    }
                ]
            });

        } catch (err) {
            console.error('Error creating quiz:', err);
            console.error('Request details:', { lessonId: parsedLessonId, quizData: formData });

            let errorMsg = 'Ошибка при создании квиза';
            if (err.response) {
                console.error('API response error:', err.response);
                if (err.response.data) {
                    if (typeof err.response.data === 'string') {
                        errorMsg = err.response.data;
                    } else if (err.response.data.detail) {
                        errorMsg = err.response.data.detail;
                    } else if (err.response.data.error) {
                        errorMsg = err.response.data.error;
                    } else if (err.response.data === 'object') {
                        const fieldErrors = [];
                        for (const [key, value] of Object.entries(err.response.data)) {
                            fieldErrors.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
                        }
                        if (fieldErrors.length) {
                            errorMsg = fieldErrors.join('; ');
                        }
                    }
                }
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ mt: 3 }}>
                <Paper sx={{ p: 3, bgcolor: 'grey.900', color: 'white' }}>
                    <Typography>Необходимо войти в систему для создания квиза</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'grey.900', borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                    Создать квиз
                </Typography>

                {success && (
                    <Alert severity="success" sx={{ mb: 2, bgcolor: 'success.dark', color: 'success.light' }}>
                        {success}
                    </Alert>
                )}

                {/* Lesson Selection */}
                <Box mb={3}>
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel id="lesson-select-label" sx={{ color: 'grey.400' }}>Выберите урок</InputLabel>
                        <Select
                            labelId="lesson-select-label"
                            id="lesson-select"
                            value={lesson?.id || ""}
                            onChange={(e) => handleLessonSelect(e.target.value)}
                            disabled={loadingLessons}
                            label="Выберите урок"
                            sx={{
                                bgcolor: 'grey.800',
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'grey.700',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                }
                            }}
                        >
                            <MenuItem value="">
                                <em>-- Выберите урок --</em>
                            </MenuItem>
                            {lessons.map(lessonItem => (
                                <MenuItem key={lessonItem.id} value={lessonItem.id}>
                                    {lessonItem.title} (ID: {lessonItem.id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Show error message if any */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2, bgcolor: 'error.dark', color: 'error.light' }}>
                        {error}
                    </Alert>
                )}

                {/* Show quiz creation form only when lesson is selected */}
                {lesson ? (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
                            Создание квиза для урока "{lesson.title}" (ID: {lesson.id})
                        </Typography>

                        <TextField
                            fullWidth
                            label="Название квиза *"
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="Введите название квиза"
                            margin="normal"
                            variant="outlined"
                            required
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'grey.800',
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'grey.700',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'grey.400',
                                }
                            }}
                        />

                        {/* Questions */}
                        <Box sx={{ mb: 3 }}>
                            {formData.questions.map((question, questionIndex) => (
                                <Paper key={questionIndex} sx={{ p: 3, mb: 3, bgcolor: 'grey.800', borderRadius: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" sx={{ color: 'white' }}>
                                            Вопрос {questionIndex + 1}
                                        </Typography>
                                        {formData.questions.length > 1 && (
                                            <IconButton
                                                onClick={() => removeQuestion(questionIndex)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={question.text}
                                        onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                                        placeholder="Текст вопроса"
                                        variant="outlined"
                                        margin="normal"
                                        sx={{
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'grey.700',
                                                color: 'white',
                                                '& fieldset': {
                                                    borderColor: 'grey.600',
                                                },
                                            }
                                        }}
                                    />

                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'grey.400' }}>
                                        Варианты ответов:
                                    </Typography>

                                    <RadioGroup
                                        name={`question-${questionIndex}-correct`}
                                        value={question.answers.findIndex(a => a.is_correct)}
                                    >
                                        {question.answers.map((answer, answerIndex) => (
                                            <Box key={answerIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <FormControlLabel
                                                    value={answerIndex}
                                                    control={
                                                        <Radio
                                                            checked={answer.is_correct}
                                                            onChange={() => handleCorrectAnswerChange(questionIndex, answerIndex)}
                                                            sx={{ color: 'primary.main' }}
                                                        />
                                                    }
                                                    label=""
                                                />
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={answer.text}
                                                    onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                                                    placeholder={`Вариант ответа ${answerIndex + 1}`}
                                                    variant="outlined"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            bgcolor: 'grey.700',
                                                            color: 'white',
                                                            '& fieldset': {
                                                                borderColor: 'grey.600',
                                                            },
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </RadioGroup>
                                </Paper>
                            ))}
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addQuestion}
                                variant="contained"
                                color="secondary"
                                sx={{ mb: 3 }}
                            >
                                Добавить вопрос
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3, bgcolor: 'grey.700' }} />

                        <Box>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ px: 4, py: 1 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Создать квиз'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" sx={{ color: 'grey.400', fontStyle: 'italic' }}>
                        Пожалуйста, выберите урок для создания квиза
                    </Typography>
                )}
            </Paper>
        </Container>
    );
}

export default QuizCreator;