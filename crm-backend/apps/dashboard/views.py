from rest_framework.response import Response
from rest_framework.views import APIView

from .summary import build_summary


class DashboardSummaryView(APIView):
    """GET /api/dashboard/summary/ — aggregate figures for the dashboard."""

    def get(self, request):
        return Response(build_summary())
