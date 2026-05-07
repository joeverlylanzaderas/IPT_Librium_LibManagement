from django.contrib import admin
from .models import Category, Author, Book, Loan, Reservation, Fine

admin.site.register(Category)
admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Loan)
admin.site.register(Reservation)
admin.site.register(Fine)