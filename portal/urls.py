from django.urls import path
from .views import (
    RegisterView, MyTokenObtainPairView,
    CategoryList, LessonList, LessonDetail,
    QuizDetail, SubmitQuiz, QuizAnalytics,
    LessonCreateView, QuizCreateView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    
    path('categories/', CategoryList.as_view(), name='category-list'),
    path('lessons/', LessonList.as_view(), name='lesson-list'),
    path('lessons/<int:pk>/', LessonDetail.as_view(), name='lesson-detail'),
    
    path('lessons/<int:lesson_id>/quiz/', QuizDetail.as_view(), name='quiz-detail'),
    path('lessons/<int:lesson_id>/quiz/submit/', SubmitQuiz.as_view(), name='quiz-submit'),
    path('lessons/<int:lesson_id>/quiz/analytics/', QuizAnalytics.as_view(), name='quiz-analytics'),
    path('lessons/create/', LessonCreateView.as_view(), name='lesson-create'),
    path('lessons/<int:lesson_id>/quiz/create/', QuizCreateView.as_view(), name='quiz-create'),
]