from django.urls import path
from .views import (
    DashboardSummaryView,
    AnalyticsOverviewView,
    MonthlyTrendsView,
    WeeklyTrendsView,
    DailyTrendsView,
    CategoryBreakdownView,
    TopCategoriesView,
    RecentActivityView,
)

urlpatterns = [
    # All roles
    path('analytics/dashboard/', DashboardSummaryView.as_view(), name='dashboard'),
    path('analytics/recent/', RecentActivityView.as_view(), name='recent_activity'),

    # Analyst + Admin only
    path('analytics/overview/', AnalyticsOverviewView.as_view(), name='overview'),
    path('analytics/trends/monthly/', MonthlyTrendsView.as_view(), name='monthly_trends'),
    path('analytics/trends/weekly/', WeeklyTrendsView.as_view(), name='weekly_trends'),
    path('analytics/trends/daily/', DailyTrendsView.as_view(), name='daily_trends'),
    path('analytics/categories/', CategoryBreakdownView.as_view(), name='category_breakdown'),
    path('analytics/top-categories/', TopCategoriesView.as_view(), name='top_categories'),
]