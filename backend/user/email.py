from djoser import utils
from djoser.conf import settings
from djoser.email import ActivationEmail


class CustomActivationEmail(ActivationEmail):
    template_name = 'email/activation.html'
    
    def get_context_data(self):
        context = super().get_context_data()
        context['site_name'] = 'Library Management System'
        return context