# Subscription Tracker

A backend application that helps you track recurring subscriptions, understand your real monthly/annual spending, and get alerted before renewals happen — so you never get surprised by a charge again.

## Status: In Development 🚧

## Why this project?

Most subscription trackers just list what you pay. This one goes further by answering the question that actually matters: **is this subscription worth it?**

By optionally logging usage per subscription, the app can calculate a "cost per use" metric and flag "zombie subscriptions" — services you keep paying for but rarely use.

## Features

- **CRUD for subscriptions**: create, view, update, and cancel subscriptions
- **Automatic billing calculations**: normalizes monthly/annual/quarterly cycles into a single comparable monthly cost
- **Spending projections**: total monthly and annual cost across all active subscriptions
- **Renewal alerts**: get notified a configurable number of days before a subscription renews
- **Usage tracking (optional)**: log whether you used a subscription on a given day
- **Cost-per-use insight**: surfaces subscriptions that cost more than they're worth based on actual usage

## Tech Stack

- **Backend**: Python + [FastAPI](https://fastapi.tiangolo.com/)
- **ORM / Database**: SQLAlchemy + SQLite (easy to swap for PostgreSQL)
- **Validation**: Pydantic
- **Scheduled jobs**: APScheduler (for renewal checks and alerts)
- **Frontend** (planned): React + Recharts dashboard, or a Streamlit prototype

## Project Structure

```
subscription-tracker/
├── main.py          # API routes
├── models.py         # Database table definitions (SQLAlchemy)
├── schemas.py         # Request/response validation (Pydantic)
├── crud.py            # Database access logic
├── database.py        # Database connection setup
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.10+

### Installation

```bash
git clone https://github.com/your-username/subscription-tracker.git
cd subscription-tracker
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the API

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive documentation (Swagger UI) is available at `http://localhost:8000/docs`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subscriptions` | Create a new subscription |
| GET | `/subscriptions` | List all subscriptions |
| GET | `/subscriptions/{id}` | Get a single subscription |
| PUT | `/subscriptions/{id}` | Update a subscription |
| DELETE | `/subscriptions/{id}` | Delete a subscription |

## Roadmap

- [ ] Basic CRUD for subscriptions
- [ ] Monthly/annual cost calculation and normalization across billing cycles
- [ ] Renewal alert system (email notifications)
- [ ] Usage tracking and cost-per-use analysis
- [ ] Dashboard frontend (spending by category, renewal timeline)
- [ ] Bank statement import (optional, future scope)

## License

This project is open source and available under the [MIT License](LICENSE).
