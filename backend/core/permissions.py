from rest_framework.permissions import BasePermission

SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')


class IsAdmin(BasePermission):
    """Full control — create, update, delete records and manage users."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsAnalystOrAdmin(BasePermission):
    """
    Analyst + Admin — view all records, apply filters,
    access insights and summaries. Cannot modify records.
    """
    message = 'Analyst or Admin access required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['analyst', 'admin']
        )


class IsAnyAuthenticated(BasePermission):
    """
    All roles (viewer, analyst, admin) — read-only access
    to dashboard and transaction list.
    """
    message = 'Authentication required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated
        )


class RecordPermission(BasePermission):
    """
    Role matrix for financial records:
    - Viewer  : GET only (view transactions + dashboard)
    - Analyst : GET only (view + filter + insights)
    - Admin   : GET + POST + PUT + PATCH + DELETE (full CRUD)
    """
    message = 'You do not have permission to modify records.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # All roles can read
        if request.method in SAFE_METHODS:
            return True

        # Only admin can write
        return request.user.role == 'admin'


class UserManagementPermission(BasePermission):
    """
    Only admin can manage users —
    create, assign roles, activate/deactivate.
    """
    message = 'Only admins can manage users.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'admin'


class AnalyticsPermission(BasePermission):
    """
    Analyst + Admin can access deep analytics,
    trends, reports, and insights.
    Viewer can only access basic dashboard summary.
    """
    message = 'Analyst or Admin access required for analytics.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['analyst', 'admin']