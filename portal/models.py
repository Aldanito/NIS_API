from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

class Lesson(models.Model):
    ACCESS_CHOICES = [
        ('public', 'Публичный'),
        ('registered', 'Только для зарегистрированных'),
        ('token', 'По ссылке/токену'),
    ]
    
    title = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lessons', null=True)
    description = models.TextField()
    video = models.FileField(upload_to='videos/')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    access_type = models.CharField(max_length=20, choices=ACCESS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    token = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.title

class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=200, null=True, blank=True) 
    def __str__(self):
        return f"Quiz for {self.lesson.title}"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=300)

    def __str__(self):
        return self.text

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class UserQuizResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    passed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s result for {self.quiz.lesson.title}"