import React, { useState, useEffect } from 'react';
import { lessonsAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function FileUpload({ onLessonCreated }) {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        access_type: 'public',
        token: ''
    });
    const [loading, setLoading] = useState(false);
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);

            // If categories exist, set the first one as default
            if (response.data && response.data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    category: response.data[0].id
                }));
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setUploadStatus('Ошибка при загрузке категорий');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFileError('');

        if (file) {
            // Check if file is a video
            if (!file.type.startsWith('video/')) {
                setFileError('Пожалуйста, выберите видеофайл');
                setSelectedFile(null);
                return;
            }

            // Check file size (limit to 100MB for example)
            if (file.size > 100 * 1024 * 1024) {
                setFileError('Файл слишком большой (максимум 100MB)');
                setSelectedFile(null);
                return;
            }

            setSelectedFile(file);
        } else {
            setSelectedFile(null);
        }

        setUploadStatus('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        // If changing access type from token to something else, clear token field
        if (name === 'access_type' && value !== 'token') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                token: ''
            }));
        }
    };

    const generateRandomToken = () => {
        const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 10; i++) {
            token += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        setFormData({
            ...formData,
            token
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!user) {
            setUploadStatus('Необходимо войти в систему для загрузки уроков.');
            return;
        }

        if (!selectedFile) {
            setUploadStatus('Пожалуйста, выберите видеофайл.');
            return;
        }

        if (!formData.title || !formData.description || !formData.category) {
            setUploadStatus('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        if (formData.access_type === 'token' && !formData.token) {
            setUploadStatus('Необходимо указать токен для доступа по ссылке.');
            return;
        }

        const data = new FormData();
        data.append('video', selectedFile);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('access_type', formData.access_type);

        if (formData.access_type === 'token') {
            data.append('token', formData.token);
        }

        setLoading(true);
        setUploadStatus('Загрузка...');

        try {
            const response = await lessonsAPI.create(data);
            setUploadStatus(`Урок успешно создан: ${response.data.title}`);

            // Reset form
            setSelectedFile(null);
            setFormData({
                title: '',
                description: '',
                category: categories.length > 0 ? categories[0].id : '',
                access_type: 'public',
                token: ''
            });

            // Reset file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            // Notify parent component
            if (onLessonCreated) {
                onLessonCreated(response.data);
            }
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            let errorMsg = 'Ошибка при загрузке файла';

            if (error.response) {
                // Handle different error response formats
                if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        errorMsg = error.response.data;
                    } else if (error.response.data.detail) {
                        errorMsg = error.response.data.detail;
                    } else if (error.response.data.error) {
                        errorMsg = error.response.data.error;
                    } else if (typeof error.response.data === 'object') {
                        // Handle field-specific validation errors
                        const fieldErrors = [];
                        for (const [key, value] of Object.entries(error.response.data)) {
                            fieldErrors.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
                        }
                        if (fieldErrors.length) {
                            errorMsg = fieldErrors.join('; ');
                        }
                    }
                }
            }

            setUploadStatus(`Ошибка: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto p-4 bg-gray-800 rounded-lg shadow-md mt-6">
                <h2 className="text-2xl font-bold mb-4 text-white">Загрузка урока</h2>
                <p className="text-gray-400">Необходимо войти в систему для загрузки уроков.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 bg-gray-800 rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Создать новый урок</h2>

            <form onSubmit={handleUpload} className="space-y-4">
                <div>
                    <label className="block text-white text-sm font-bold mb-2">
                        Название урока *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите название урока"
                    />
                </div>

                <div>
                    <label className="block text-white text-sm font-bold mb-2">
                        Описание урока *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите описание урока"
                    />
                </div>

                <div>
                    <label className="block text-white text-sm font-bold mb-2">
                        Категория *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-white text-sm font-bold mb-2">
                        Тип доступа *
                    </label>
                    <select
                        name="access_type"
                        value={formData.access_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="public">Публичный</option>
                        <option value="registered">Только для зарегистрированных</option>
                        <option value="token">По ссылке/токену</option>
                    </select>
                </div>

                {formData.access_type === 'token' && (
                    <div>
                        <label className="block text-white text-sm font-bold mb-2">
                            Токен доступа *
                        </label>
                        <div className="flex">
                            <input
                                type="text"
                                name="token"
                                value={formData.token}
                                onChange={handleInputChange}
                                required
                                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Введите токен для доступа"
                            />
                            <button
                                type="button"
                                onClick={generateRandomToken}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-md transition"
                            >
                                Сгенерировать
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-white text-sm font-bold mb-2">
                        Видеофайл *
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="video/*"
                        required
                        className="block w-full text-sm text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-500 file:text-white
                     hover:file:bg-blue-600"
                    />
                    {fileError && (
                        <p className="mt-1 text-sm text-red-400">{fileError}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !!fileError}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                    {loading ? 'Создание урока...' : 'Создать урок'}
                </button>
            </form>

            {uploadStatus && (
                <div className={`mt-4 text-sm ${uploadStatus.startsWith('Ошибка') ? 'text-red-400' : 'text-green-400'}`}>
                    {uploadStatus}
                </div>
            )}
        </div>
    );
}

export default FileUpload;
