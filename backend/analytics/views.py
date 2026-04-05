from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import IsAnyAuthenticated, AnalyticsPermission
from . import services


class DashboardSummaryView(APIView):
    """
    All roles — basic summary cards.
    Total income, expenses, net balance.
    """
    permission_classes = [IsAnyAuthenticated]

    def get(self, request):
        return Response({
            'summary': services.get_summary(),
            'current_month': services.get_current_month_summary(),
            'recent_activity': services.get_recent_activity(limit=5),
        })


class AnalyticsOverviewView(APIView):
    """
    Analyst + Admin only — full analytics.
    """
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        return Response({
            'summary': services.get_summary(),
            'monthly_trends': services.get_monthly_trends(months=months),
            'category_breakdown': services.get_category_breakdown(),
            'top_expenses': services.get_top_categories(limit=5, record_type='expense'),
            'top_income': services.get_top_categories(limit=5, record_type='income'),
        })


class MonthlyTrendsView(APIView):
    """Monthly income vs expenses chart data."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        return Response(services.get_monthly_trends(months=months))


class WeeklyTrendsView(APIView):
    """Weekly income vs expenses chart data."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        weeks = int(request.query_params.get('weeks', 8))
        return Response(services.get_weekly_trends(weeks=weeks))


class DailyTrendsView(APIView):
    """Daily breakdown for last N days."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(services.get_daily_trends(days=days))


class CategoryBreakdownView(APIView):
    """Category wise totals, optionally filtered by type."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        record_type = request.query_params.get('type', None)
        return Response(
            services.get_category_breakdown(record_type=record_type)
        )


class TopCategoriesView(APIView):
    """Top spending or income categories."""
    permission_classes = [AnalyticsPermission]

    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        record_type = request.query_params.get('type', 'expense')
        return Response(
            services.get_top_categories(limit=limit, record_type=record_type)
        )


class RecentActivityView(APIView):
    """Recent transactions feed — all roles."""
    permission_classes = [IsAnyAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        return Response(services.get_recent_activity(limit=limit))