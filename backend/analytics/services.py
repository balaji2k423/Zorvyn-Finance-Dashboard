from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay
from datetime import date, timedelta
from records.models import FinancialRecord, Category


def get_base_queryset():
    """Always exclude soft deleted records."""
    return FinancialRecord.objects.filter(is_deleted=False)


def get_summary(user=None):
    """
    Total income, total expenses, net balance.
    Used for the main dashboard cards.
    """
    qs = get_base_queryset()

    totals = qs.aggregate(
        total_income=Sum('amount', filter=Q(type='income')),
        total_expenses=Sum('amount', filter=Q(type='expense')),
        total_records=Count('id'),
        income_count=Count('id', filter=Q(type='income')),
        expense_count=Count('id', filter=Q(type='expense')),
    )

    total_income = totals['total_income'] or 0
    total_expenses = totals['total_expenses'] or 0
    net_balance = total_income - total_expenses

    return {
        'total_income': float(total_income),
        'total_expenses': float(total_expenses),
        'net_balance': float(net_balance),
        'total_records': totals['total_records'],
        'income_count': totals['income_count'],
        'expense_count': totals['expense_count'],
        'savings_rate': round(
            (float(net_balance) / float(total_income) * 100)
            if total_income > 0 else 0, 2
        ),
    }


def get_category_breakdown(record_type=None):
    """
    Category wise totals.
    Optionally filter by type (income/expense).
    """
    qs = get_base_queryset()

    if record_type:
        qs = qs.filter(type=record_type)

    breakdown = (
        qs.values('category__name', 'type')
        .annotate(
            total=Sum('amount'),
            count=Count('id'),
        )
        .order_by('-total')
    )

    return [
        {
            'category': item['category__name'] or 'Uncategorized',
            'type': item['type'],
            'total': float(item['total']),
            'count': item['count'],
        }
        for item in breakdown
    ]


def get_monthly_trends(months=12):
    """
    Income vs expenses per month for the last N months.
    Used for the line/bar chart on dashboard.
    """
    qs = get_base_queryset()

    # Calculate start date
    start_date = date.today().replace(day=1) - timedelta(days=30 * months)
    qs = qs.filter(date__gte=start_date)

    monthly = (
        qs.annotate(month=TruncMonth('date'))
        .values('month', 'type')
        .annotate(total=Sum('amount'))
        .order_by('month')
    )

    # Build a clean dict grouped by month
    trends = {}
    for item in monthly:
        month_str = item['month'].strftime('%Y-%m')
        if month_str not in trends:
            trends[month_str] = {
                'month': month_str,
                'income': 0,
                'expenses': 0,
                'net': 0,
            }
        if item['type'] == 'income':
            trends[month_str]['income'] = float(item['total'])
        else:
            trends[month_str]['expenses'] = float(item['total'])

    # Calculate net for each month
    for month in trends.values():
        month['net'] = round(month['income'] - month['expenses'], 2)

    return sorted(trends.values(), key=lambda x: x['month'])


def get_weekly_trends(weeks=8):
    """
    Income vs expenses per week for the last N weeks.
    """
    qs = get_base_queryset()
    start_date = date.today() - timedelta(weeks=weeks)
    qs = qs.filter(date__gte=start_date)

    weekly = (
        qs.annotate(week=TruncWeek('date'))
        .values('week', 'type')
        .annotate(total=Sum('amount'))
        .order_by('week')
    )

    trends = {}
    for item in weekly:
        week_str = item['week'].strftime('%Y-%m-%d')
        if week_str not in trends:
            trends[week_str] = {
                'week': week_str,
                'income': 0,
                'expenses': 0,
                'net': 0,
            }
        if item['type'] == 'income':
            trends[week_str]['income'] = float(item['total'])
        else:
            trends[week_str]['expenses'] = float(item['total'])

    for week in trends.values():
        week['net'] = round(week['income'] - week['expenses'], 2)

    return sorted(trends.values(), key=lambda x: x['week'])


def get_recent_activity(limit=10):
    """
    Last N transactions for the activity feed.
    """
    qs = get_base_queryset().select_related('category', 'created_by')
    records = qs[:limit]

    return [
        {
            'id': r.id,
            'amount': float(r.amount),
            'type': r.type,
            'category': r.category.name if r.category else 'Uncategorized',
            'date': r.date.strftime('%Y-%m-%d'),
            'notes': r.notes or '',
            'created_by': r.created_by.email if r.created_by else '',
        }
        for r in records
    ]


def get_daily_trends(days=30):
    """
    Daily breakdown for the last N days.
    """
    qs = get_base_queryset()
    start_date = date.today() - timedelta(days=days)
    qs = qs.filter(date__gte=start_date)

    daily = (
        qs.annotate(day=TruncDay('date'))
        .values('day', 'type')
        .annotate(total=Sum('amount'))
        .order_by('day')
    )

    trends = {}
    for item in daily:
        day_str = item['day'].strftime('%Y-%m-%d')
        if day_str not in trends:
            trends[day_str] = {
                'day': day_str,
                'income': 0,
                'expenses': 0,
                'net': 0,
            }
        if item['type'] == 'income':
            trends[day_str]['income'] = float(item['total'])
        else:
            trends[day_str]['expenses'] = float(item['total'])

    for day in trends.values():
        day['net'] = round(day['income'] - day['expenses'], 2)

    return sorted(trends.values(), key=lambda x: x['day'])


def get_top_categories(limit=5, record_type='expense'):
    """
    Top N categories by total amount.
    Defaults to expenses — most useful for budget analysis.
    """
    qs = get_base_queryset().filter(type=record_type)

    top = (
        qs.values('category__name')
        .annotate(
            total=Sum('amount'),
            count=Count('id'),
            avg=Avg('amount'),
        )
        .order_by('-total')[:limit]
    )

    return [
        {
            'category': item['category__name'] or 'Uncategorized',
            'total': float(item['total']),
            'count': item['count'],
            'average': round(float(item['avg']), 2),
        }
        for item in top
    ]


def get_current_month_summary():
    """
    Summary for current month only.
    Used for the 'this month' stats on dashboard.
    """
    today = date.today()
    qs = get_base_queryset().filter(
        date__year=today.year,
        date__month=today.month
    )

    totals = qs.aggregate(
        total_income=Sum('amount', filter=Q(type='income')),
        total_expenses=Sum('amount', filter=Q(type='expense')),
    )

    total_income = float(totals['total_income'] or 0)
    total_expenses = float(totals['total_expenses'] or 0)

    return {
        'month': today.strftime('%B %Y'),
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_balance': round(total_income - total_expenses, 2),
    }