use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Payout {
    pub id: Uuid,
    pub affiliate_id: Uuid,
    pub amount: sqlx::types::BigDecimal,
    pub currency: String,
    pub method: String,
    pub status: String,
    pub transaction_id: Option<String>,
    pub payout_details: Option<serde_json::Value>,
    pub notes: Option<String>,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub conversions_count: i32,
    pub processed_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub failed_reason: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RequestPayout {
    pub amount: f64,
    pub method: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePayoutStatus {
    pub status: String,
    pub transaction_id: Option<String>,
    pub failed_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BatchPayoutRequest {
    pub min_amount: Option<f64>,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct PayoutQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
    pub affiliate_id: Option<Uuid>,
    pub method: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PayoutResponse {
    pub id: Uuid,
    pub affiliate_id: Uuid,
    pub amount: f64,
    pub currency: String,
    pub method: String,
    pub status: String,
    pub transaction_id: Option<String>,
    pub notes: Option<String>,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub conversions_count: i32,
    pub processed_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub failed_reason: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Payout> for PayoutResponse {
    fn from(p: Payout) -> Self {
        use std::str::FromStr;
        Self {
            id: p.id,
            affiliate_id: p.affiliate_id,
            amount: f64::from_str(&p.amount.to_string()).unwrap_or(0.0),
            currency: p.currency,
            method: p.method,
            status: p.status,
            transaction_id: p.transaction_id,
            notes: p.notes,
            period_start: p.period_start,
            period_end: p.period_end,
            conversions_count: p.conversions_count,
            processed_at: p.processed_at,
            completed_at: p.completed_at,
            failed_reason: p.failed_reason,
            created_at: p.created_at,
            updated_at: p.updated_at,
        }
    }
}
