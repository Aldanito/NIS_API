import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
    AlertTitle,
    FormControl,
    InputLabel,
    Input,
    FormHelperText,
    Divider,
    Select,
    MenuItem
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { lessonsAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function CourseCreate() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video_url: '',
        category: '',
        access_type: 'public' // Default to public
    });
    const [categories, setCategories] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesAPI.getAll();
                setCategories(response.data);

                // Set default category if available
                if (response.data && response.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        category: response.data[0].id
                    }));
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Не удалось загрузить список категорий');
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (error) setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024 * 1024) { // 500 MB limit
                setError('Размер файла не должен превышать 500 MB');
                return;
            }

            // Check if file is a video
            if (!file.type.startsWith('video/')) {
                setError('Пожалуйста, загрузите видеофайл');
                return;
            }

            setVideoFile(file);
            setError('');
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Необходимо указать название курса');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Необходимо указать описание курса');
            return false;
        }
        if (!videoFile && !formData.video_url.trim()) {
            setError('Необходимо загрузить видеофайл или указать ссылку на видео');
            return false;
        }
        if (!formData.category) {
            setError('Необходимо выбрать категорию');
            return false;
        }
        if (!formData.access_type) {
            setError('Необходимо указать тип доступа');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('category', formData.category);
            formDataToSend.append('access_type', formData.access_type);

            if (videoFile) {
                formDataToSend.append('video', videoFile);
            } else if (formData.video_url.trim()) {
                formDataToSend.append('video_url', formData.video_url.trim());
            }

            // Configure upload progress tracking
            const onUploadProgress = (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            };

            const response = await lessonsAPI.create(formDataToSend, { onUploadProgress });
            setSuccess(`Курс "${response.data.title}" успешно создан!`);

            // Reset form
            setFormData({
                title: '',
                description: '',
                video_url: '',
                category: categories.length > 0 ? categories[0].id : '',
                access_type: 'public'
            });
            setVideoFile(null);

        } catch (err) {
            console.error('Error creating course:', err);

            let errorMsg = 'Ошибка при создании курса';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMsg = err.response.data;
                } else if (err.response.data.detail) {
                    errorMsg = err.response.data.detail;
                } else if (err.response.data.error) {
                    errorMsg = err.response.data.error;
                } else if (typeof err.response.data === 'object') {
                    // Check for validation errors
                    const fieldErrors = [];
                    for (const [key, value] of Object.entries(err.response.data)) {
                        fieldErrors.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
                    }
                    if (fieldErrors.length) {
                        errorMsg = fieldErrors.join('; ');
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
                <Paper elevation={3} sx={{ p: 3, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
                    <Typography>Необходимо войти в систему для создания курса</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 3 }}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
                <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Создать новый курс
                </Typography>

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <AlertTitle>Успех</AlertTitle>
                        {success}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Название курса"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Введите название курса"
                        required
                        fullWidth
                        variant="outlined"
                        InputProps={{
                            sx: { bgcolor: 'background.paper' }
                        }}
                    />

                    <TextField
                        label="Описание курса"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Введите описание курса"
                        required
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        InputProps={{
                            sx: { bgcolor: 'background.paper' }
                        }}
                    />

                    {/* Category Selection */}
                    <FormControl fullWidth required>
                        <InputLabel id="category-label" sx={{ bgcolor: 'primary.dark', px: 0.5 }}>Категория</InputLabel>
                        <Select
                            labelId="category-label"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            label="Категория"
                            sx={{ bgcolor: 'background.paper' }}
                        >
                            {categories.length > 0 ? (
                                categories.map(category => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.title}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled value="">
                                    Нет доступных категорий
                                </MenuItem>
                            )}
                        </Select>
                        {categories.length === 0 && (
                            <FormHelperText sx={{ color: 'error.light' }}>
                                Категории не загружены. Пожалуйста, обновите страницу.
                            </FormHelperText>
                        )}
                    </FormControl>

                    {/* Access Type Selection */}
                    <FormControl fullWidth required>
                        <InputLabel id="access-type-label" sx={{ bgcolor: 'primary.dark', px: 0.5 }}>Тип доступа</InputLabel>
                        <Select
                            labelId="access-type-label"
                            name="access_type"
                            value={formData.access_type}
                            onChange={handleChange}
                            label="Тип доступа"
                            sx={{ bgcolor: 'background.paper' }}
                        >
                            <MenuItem value="public">Публичный</MenuItem>
                            <MenuItem value="registered">Только для зарегистрированных</MenuItem>
                            <MenuItem value="token">По ссылке/токену</MenuItem>
                        </Select>
                        <FormHelperText sx={{ color: 'info.light' }}>
                            {formData.access_type === 'public' && 'Курс будет доступен всем пользователям'}
                            {formData.access_type === 'registered' && 'Курс будет доступен только зарегистрированным пользователям'}
                            {formData.access_type === 'token' && 'Курс будет доступен только по специальной ссылке с токеном'}
                        </FormHelperText>
                    </FormControl>

                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        Видео курса
                    </Typography>

                    <FormControl fullWidth>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                                mb: 2,
                                bgcolor: videoFile ? 'success.main' : 'primary.main',
                                '&:hover': {
                                    bgcolor: videoFile ? 'success.dark' : 'primary.dark',
                                }
                            }}
                        >
                            {videoFile ? 'Видео выбрано' : 'Загрузить видеофайл'}
                            <VisuallyHiddenInput type="file" accept="video/*" onChange={handleFileChange} />
                        </Button>

                        {videoFile && (
                            <FormHelperText sx={{ color: 'success.light', mb: 2 }}>
                                Выбран файл: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </FormHelperText>
                        )}

                        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>ИЛИ</Typography>
                        </Divider>

                        <TextField
                            label="Ссылка на видео (альтернативно)"
                            name="video_url"
                            value={formData.video_url}
                            onChange={handleChange}
                            placeholder="Введите ссылку на видео (если нет файла)"
                            fullWidth
                            variant="outlined"
                            disabled={!!videoFile}
                            InputProps={{
                                sx: { bgcolor: 'background.paper' }
                            }}
                            helperText="Если вы загрузили файл, ссылка не требуется"
                        />
                    </FormControl>

                    {loading && uploadProgress > 0 && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Загрузка: {uploadProgress}%
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '10px',
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 1,
                                    overflow: 'hidden'
                                }}
                            >
                                <Box
                                    sx={{
                                        width: `${uploadProgress}%`,
                                        height: '100%',
                                        bgcolor: 'success.main',
                                        transition: 'width 0.3s ease'
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="contained"
                            color="success"
                            sx={{ py: 1, px: 3 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Создать курс'}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            <AlertTitle>Ошибка</AlertTitle>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default CourseCreate;