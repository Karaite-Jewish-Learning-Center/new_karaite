from django.utils.translation import gettext as _
from django import forms
from .models import Comment
from tinymce.widgets import TinyMCE


class AdminCommentForm(forms.ModelForm):
    comment_en = forms.CharField(label=_('Comment English'),
                                 widget=TinyMCE(content_language="en"))

    comment_he = forms.CharField(label=_('Comment Hebrew'),
                                 widget=TinyMCE(content_language='he_IL'))

    class Meta:
        model = Comment
        fields = '__all__'
