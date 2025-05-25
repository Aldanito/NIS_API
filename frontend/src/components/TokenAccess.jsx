import React, { useState, useEffect } from 'react';
import { lessonsAPI } from '../services/api';

function TokenAccess({ lesson, onAccessGranted }) {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');

        if (urlToken) {
            setToken(urlToken);
            handleTokenValidation(urlToken);
        }
    }, []);

    const handleTokenValidation = async (tokenValue = token) => {
        if (!tokenValue.trim()) {
            setError('Пожалуйста, введите токен доступа');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await lessonsAPI.getById(lesson.id, tokenValue);

            sessionStorage.setItem(`lesson_token_${lesson.id}`, tokenValue);

            onAccessGranted(response.data);
        } catch (err) {
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Неверный токен доступа');
                } else if (err.response.status === 404) {
                    setError('Урок не найден');
                } else {
                    setError('Ошибка доступа. Пожалуйста, попробуйте позже.');
                }
            } else {
                setError('Проблема с сетевым подключением. Пожалуйста, проверьте соединение.');
            }
            console.error('Token access error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleTokenValidation();
    };

    return (
        <div className="p-4 bg-yellow-900 bg-opacity-50 rounded-lg border border-yellow-600">
            <h3 className="text-lg font-semibold text-yellow-300 mb-3">
                🔑 Требуется токен доступа
            </h3>
            <p className="text-yellow-200 mb-4">
                Этот урок доступен только по специальной ссылке или токену.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => {
                            setToken(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Введите токен доступа"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="text-red-400 text-sm">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={loading || !token.trim()}
                    className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition duration-300"
                >
                    {loading ? 'Проверка...' : 'Получить доступ'}
                </button>
            </form>

            <p className="mt-4 text-xs text-yellow-200 opacity-75">
                Если у вас есть доступ к этому уроку, но вы не знаете токен,
                пожалуйста, свяжитесь с администратором.
            </p>
        </div>
    );
}

export default TokenAccess;