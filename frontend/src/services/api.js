import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem("accessToken", response.data.access);

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/register/", userData),
  login: (credentials) => api.post("/login/", credentials),
};

// Categories API calls
export const categoriesAPI = {
  getAll: () => api.get("/categories/"),
  getById: (id) => api.get(`/categories/${id}/`),
};

// Lessons API calls
export const lessonsAPI = {
  getAll: (categoryId = null) => {
    const params = categoryId ? { category: categoryId } : {};
    return api.get("/lessons/", { params });
  },
  getById: (id, token = null) => {
    const params = token ? { token } : {};
    return api.get(`/lessons/${id}/`, { params });
  },
  create: (formData) => {
    return api.post("/lessons/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getCoursesWithoutQuiz: () => api.get("/lessons/without-quiz/"),
  getCategories: () => api.get("/categories/"), // Add this line to utilize the categories endpoint
};

// Quiz API calls
export const quizAPI = {
  getByLessonId: (lessonId) => api.get(`/lessons/${lessonId}/quiz/`),
  submit: (lessonId, answers) =>
    api.post(`/lessons/${lessonId}/quiz/submit/`, { answers }),
  getAnalytics: (lessonId) => api.get(`/lessons/${lessonId}/quiz/analytics/`),
  create: (lessonId, quizData) =>
    api.post(`/lessons/${lessonId}/quiz/create/`, quizData),
};

export default api;
