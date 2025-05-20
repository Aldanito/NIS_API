from django.shortcuts import render
from django.contrib.auth import get_user_model

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, Lesson, Quiz, Question, Answer, UserQuizResult
from .serializers import (
    UserSerializer, MyTokenObtainPairSerializer, 
    CategorySerializer, LessonSerializer,
    QuizSerializer, UserQuizResultSerializer,
    QuizSubmissionSerializer, LessonCreateSerializer, QuizCreateSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated


class RegisterView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class LessonList(generics.ListAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Lesson.objects.all()
        
        if not user.is_authenticated:
            queryset = queryset.filter(access_type='public')
        elif not user.is_staff:
            queryset = queryset.exclude(access_type='token')
        
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset

class LessonDetail(generics.RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        if obj.access_type == 'public':
            return obj
        elif obj.access_type == 'registered' and user.is_authenticated:
            return obj
        elif obj.access_type == 'token':
            token = self.request.query_params.get('token')
            if token == obj.token or user.is_staff:
                return obj
        
        raise PermissionDenied("You don't have permission to access this lesson.")

class QuizDetail(generics.RetrieveAPIView):
    serializer_class = QuizSerializer

    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        return get_object_or_404(Quiz, lesson_id=lesson_id)

class SubmitQuiz(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        quiz = get_object_or_404(Quiz, lesson_id=lesson_id)
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        answers = serializer.validated_data['answers']
        questions = quiz.questions.all()
        
        if len(answers) != questions.count():
            return Response(
                {"error": "Number of answers doesn't match number of questions"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        correct = 0
        for question, answer_id in zip(questions, answers):
            try:
                answer = question.answers.get(id=answer_id)
                if answer.is_correct:
                    correct += 1
            except Answer.DoesNotExist:
                pass
        
        score = (correct / questions.count()) * 100
        UserQuizResult.objects.create(
            user=request.user,
            quiz=quiz,
            score=score
        )
        
        return Response({"score": score}, status=status.HTTP_201_CREATED)

class QuizAnalytics(APIView):
    def get(self, request, lesson_id):
        quiz = get_object_or_404(Quiz, lesson_id=lesson_id)
        results = UserQuizResult.objects.filter(quiz=quiz)
        
        avg_score = results.aggregate(Avg('score'))['score__avg'] or 0
        attempts_count = results.count()
        
        user_last_attempt = None
        if request.user.is_authenticated:
            user_last_attempt = results.filter(user=request.user).order_by('-passed_at').first()
        
        data = {
            'average_score': round(avg_score, 2),
            'attempts_count': attempts_count,
            'user_last_attempt': UserQuizResultSerializer(user_last_attempt).data if user_last_attempt else None
        }
        
        return Response(data)


class LessonCreateView(generics.CreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonCreateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class QuizCreateView(generics.CreateAPIView):
    serializer_class = QuizCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        lesson_id = kwargs.get('lesson_id')
        lesson = get_object_or_404(Lesson, id=lesson_id, owner=request.user)
        
        if hasattr(lesson, 'quiz'):
            return Response(
                {"error": "Quiz already exists for this lesson"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quiz = Quiz.objects.create(
            lesson=lesson,
            title=serializer.validated_data.get('title', '')
        )
        
        for q_data in serializer.validated_data['questions']:
            question = Question.objects.create(
                quiz=quiz,
                text=q_data['text']
            )
            for a_data in q_data['answers']:
                Answer.objects.create(
                    question=question,
                    text=a_data['text'],
                    is_correct=a_data['is_correct']
                )
        
        return Response(QuizSerializer(quiz).data, status=status.HTTP_201_CREATED)