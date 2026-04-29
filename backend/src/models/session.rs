use chrono::{DateTime, Utc};
use ipnetwork::IpNetwork;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Session {
    pub id: Uuid,
    pub visitor_id: String,
    pub affiliate_id: Uuid,
    pub link_id: Uuid,
    pub product_id: Uuid,
    pub ip_address: IpNetwork,
    pub user_agent: Option<String>,
    pub landing_page: Option<String>,
    pub referrer: Option<String>,
    pub utm_source: Option<String>,
    pub utm_medium: Option<String>,
    pub utm_campaign: Option<String>,
    pub country: Option<String>,
    pub device_type: Option<String>,
    pub first_click_at: DateTime<Utc>,
    pub last_click_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub converted: bool,
    pub converted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}
