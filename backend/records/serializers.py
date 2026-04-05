from rest_framework import serializers
from .models import FinancialRecord, Category


class CategorySerializer(serializers.ModelSerializer):
    record_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'record_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_record_count(self, obj):
        return obj.records.filter(is_deleted=False).count()


class FinancialRecordSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    created_by_email = serializers.CharField(
        source='created_by.email', read_only=True
    )

    class Meta:
        model = FinancialRecord
        fields = [
            'id', 'amount', 'type', 'category', 'category_name',
            'date', 'notes', 'created_by', 'created_by_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_type(self, value):
        if value not in ['income', 'expense']:
            raise serializers.ValidationError('Type must be income or expense.')
        return value

    def validate_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError('Date cannot be in the future.')
        return value


class FinancialRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialRecord
        fields = ['amount', 'type', 'category', 'date', 'notes']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError('Date cannot be in the future.')
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)