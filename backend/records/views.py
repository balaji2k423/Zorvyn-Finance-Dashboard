from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter   # add SearchFilter
from core.permissions import RecordPermission, IsAdmin
from .models import FinancialRecord, Category
from .filters import FinancialRecordFilter
from .serializers import (
    FinancialRecordSerializer,
    FinancialRecordCreateSerializer,
    CategorySerializer
)


class FinancialRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [RecordPermission]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = FinancialRecordFilter
    search_fields = ['notes', 'created_by__email', 'category__name']  # add this
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        return FinancialRecord.objects.filter(
            is_deleted=False
        ).select_related('category', 'created_by')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FinancialRecordCreateSerializer
        return FinancialRecordSerializer

    def destroy(self, request, *args, **kwargs):
        record = self.get_object()
        record.soft_delete(request.user)
        return Response(
            {'message': 'Record deleted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='deleted',
            permission_classes=[IsAdmin])
    def deleted_records(self, request):
        records = FinancialRecord.objects.filter(
            is_deleted=True
        ).select_related('category', 'created_by', 'deleted_by')
        serializer = FinancialRecordSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='restore',
            permission_classes=[IsAdmin])
    def restore(self, request, pk=None):
        try:
            record = FinancialRecord.objects.get(pk=pk, is_deleted=True)
            record.is_deleted = False
            record.deleted_at = None
            record.deleted_by = None
            record.save()
            return Response({'message': 'Record restored successfully.'})
        except FinancialRecord.DoesNotExist:
            return Response(
                {'error': 'Record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [RecordPermission]