from django.urls import path

from . import views

urlpatterns = [
    path('', views.chat_messages_view, name='chat_messages'),
]
