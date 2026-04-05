from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinancialRecordViewSet, CategoryViewSet

router = DefaultRouter()
router.register('records', FinancialRecordViewSet, basename='records')
router.register('categories', CategoryViewSet, basename='categories')

urlpatterns = [
    path('', include(router.urls)),
]