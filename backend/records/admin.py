from django.contrib import admin
from .models import FinancialRecord, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']


@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = ['type', 'amount', 'category', 'date',
                    'created_by', 'is_deleted', 'created_at']
    list_filter = ['type', 'category', 'is_deleted', 'date']
    search_fields = ['notes', 'category__name']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']

    def get_queryset(self, request):
        # Show all records including soft deleted in admin
        return FinancialRecord.objects.all()