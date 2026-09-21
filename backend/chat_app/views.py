import json

from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Chat


def chat_to_dict(chat):
    return {
        'id': chat.id,
        'name': chat.name,
        'message': chat.message,
        'created_at': chat.created_at.isoformat(),
    }


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def chat_view(request):
    if request.method == 'GET':
        chats = Chat.objects.all()
        return JsonResponse([chat_to_dict(chat) for chat in chats], safe=False)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Ungueltiges JSON'}, status=400)

    chat = Chat(
        name=str(data.get('name', '')).strip(),
        message=str(data.get('message', '')).strip(),
    )
    try:
        chat.full_clean()
    except ValidationError as error:
        return JsonResponse({'errors': error.message_dict}, status=400)

    chat.save()
    return JsonResponse(chat_to_dict(chat), status=201)
