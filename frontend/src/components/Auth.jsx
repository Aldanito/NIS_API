import React, { useState } from 'react';
import { authAPI } from '../services/api';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    CircularProgress,
    Alert,
    Link
} from '@mui/material';

function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const response = await authAPI.login({
                    username: formData.username,
                    password: formData.password,
                });

                // Store tokens
                localStorage.setItem('accessToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);

                // Call parent component callback
                onLogin(response.data);
            } else {
                await authAPI.register(formData);
                setIsLogin(true);
                setError('Регистрация успешна! Пожалуйста, войдите.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    mt: 8,
                    backgroundColor: theme => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
                }}
            >
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    {isLogin ? 'Войти' : 'Регистрация'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Имя пользователя"
                        name="username"
                        autoComplete="username"
                        value={formData.username}
                        onChange={handleChange}
                        variant="outlined"
                        autoFocus
                    />

                    {!isLogin && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    )}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Пароль"
                        type="password"
                        id="password"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        value={formData.password}
                        onChange={handleChange}
                        variant="outlined"
                    />

                    {error && (
                        <Alert severity={error.includes('успешна') ? "success" : "error"} sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </Button>

                    <Box textAlign="center" mt={2}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => setIsLogin(!isLogin)}
                            underline="hover"
                            color="primary"
                        >
                            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Auth;