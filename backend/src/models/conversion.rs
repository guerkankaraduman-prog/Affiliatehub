use chrono::{DateTime, Utc};
use ipnetwork::IpNetwork;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Conversion {
    pub id: Uuid,
    pub click_id: Option<Uuid>,
    pub session_id: Uuid,
    pub link_id: Uuid,
    pub affiliate_id: Uuid,
    pub product_id: Uuid,
    pub order_id: Option<String>,
    pub order_amount: sqlx::types::BigDecimal,
    pub commission_amount: sqlx::types::BigDecimal,
    pub commission_rate: sqlx::types::BigDecimal,
    pub commission_type: String,
    pub currency: String,
    pub status: String,
    pub rejection_reason: Option<String>,
    pub ip_address: Option<IpNetwork>,
    pub metadata: Option<serde_json::Value>,
    pub approved_at: Option<DateTime<Utc>>,
    pub paid_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RecordConversionRequest {
    pub order_id: Option<String>,
    pub order_amount: f64,
    pub currency: Option<String>,
    pub product_id: Uuid,
    pub customer_ip: Option<String>,
    pub session_id: Uuid,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct PostbackRequest {
    pub click_id: Option<Uuid>,
    pub order_id: Option<String>,
    pub amount: f64,
    pub currency: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ConversionQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub product_id: Option<Uuid>,
    pub affiliate_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateConversionStatus {
    pub status: String,
    pub rejection_reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ConversionResponse {
    pub id: Uuid,
    pub click_id: Option<Uuid>,
    pub session_id: Uuid,
    pub link_id: Uuid,
    pub affiliate_id: Uuid,
    pub product_id: Uuid,
    pub order_id: Option<String>,
    pub order_amount: f64,
    pub commission_amount: f64,
    pub commission_rate: f64,
    pub commission_type: String,
    pub currency: String,
    pub status: String,
    pub rejection_reason: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
    pub paid_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Conversion> for ConversionResponse {
    fn from(c: Conversion) -> Self {
        use std::str::FromStr;
        Self {
            id: c.id,
            click_id: c.click_id,
            session_id: c.session_id,
            link_id: c.link_id,
            affiliate_id: c.affiliate_id,
            product_id: c.product_id,
            order_id: c.order_id,
            order_amount: f64::from_str(&c.order_amount.to_string()).unwrap_or(0.0),
            commission_amount: f64::from_str(&c.commission_amount.to_string()).unwrap_or(0.0),
            commission_rate: f64::from_str(&c.commission_rate.to_string()).unwrap_or(0.0),
            commission_type: c.commission_type,
            currency: c.currency,
            status: c.status,
            rejection_reason: c.rejection_reason,
            approved_at: c.approved_at,
            paid_at: c.paid_at,
            created_at: c.created_at,
            updated_at: c.updated_at,
        }
    }
}
