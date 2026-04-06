import django_filters
from .models import FinancialRecord


class FinancialRecordFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to   = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    category_name = django_filters.CharFilter(field_name='category__name', lookup_expr='icontains')
    month = django_filters.NumberFilter(field_name='date', lookup_expr='month')
    year  = django_filters.NumberFilter(field_name='date', lookup_expr='year')

    class Meta:
        model  = FinancialRecord
        fields = ['type', 'category', 'date_from', 'date_to',
                  'amount_min', 'amount_max', 'category_name', 'month', 'year']