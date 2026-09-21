from django.core.validators import MinLengthValidator
from django.db import models


class Chat(models.Model):
    name = models.CharField(max_length=30, validators=[MinLengthValidator(2)])
    message = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.name}: {self.message[:40]}'
