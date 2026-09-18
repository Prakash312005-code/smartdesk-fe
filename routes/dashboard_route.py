from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.connection import get_db
from dependencies.auth import get_current_admin
from models.admin import Admin
from models.ticket import Ticket


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    # Count tickets by status

    status_results = (
        db.query(
            Ticket.status,
            func.count(Ticket.id)
        )
        .group_by(Ticket.status)
        .all()
    )

    # Count tickets by category

    category_results = (
        db.query(
            Ticket.category,
            func.count(Ticket.id)
        )
        .group_by(Ticket.category)
        .all()
    )

    # Count tickets by priority

    priority_results = (
        db.query(
            Ticket.priority,
            func.count(Ticket.id)
        )
        .group_by(Ticket.priority)
        .all()
    )

    # Count tickets created in last 7 days

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    last_7_days_count = (
        db.query(func.count(Ticket.id))
        .filter(Ticket.created_at >= seven_days_ago)
        .scalar()
    )

    # Return dashboard data

    return {
        "status_counts": {
            status: count
            for status, count in status_results
        },

        "category_counts": {
            category: count
            for category, count in category_results
        },

        "priority_counts": {
            priority: count
            for priority, count in priority_results
        },

        "last_7_days": last_7_days_count
    }