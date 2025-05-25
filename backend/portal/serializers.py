from rest_framework import serializers
from .models import Category, Lesson, Quiz, Question, Answer, UserQuizResult
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email

        return token

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = '__all__'

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'answers']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'lesson', 'questions']

class UserQuizResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizResult
        fields = '__all__'

class QuizSubmissionSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

from rest_framework.parsers import MultiPartParser, FormParser

class LessonCreateSerializer(serializers.ModelSerializer):
    video = serializers.FileField(required=True)
    
    class Meta:
        model = Lesson
        fields = ['title', 'description', 'video', 'category', 'access_type', 'token']
        extra_kwargs = {
            'token': {'required': False}
        }

class QuizCreateSerializer(serializers.ModelSerializer):
    questions = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=True
    )
    
    class Meta:
        model = Quiz
        fields = ['title', 'questions']
    
    def validate_questions(self, value):
        for q in value:
            if not all(k in q for k in ['text', 'answers']):
                raise serializers.ValidationError("Each question must have 'text' and 'answers'")
            for a in q['answers']:
                if not all(k in a for k in ['text', 'is_correct']):
                    raise serializers.ValidationError("Each answer must have 'text' and 'is_correct'")
        return value