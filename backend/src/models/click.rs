use chrono::{DateTime, Utc};
use ipnetwork::IpNetwork;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Click {
    pub id: Uuid,
    pub link_id: Uuid,
    pub affiliate_id: Uuid,
    pub product_id: Uuid,
    pub ip_address: IpNetwork,
    pub user_agent: Option<String>,
    pub referer: Option<String>,
    pub country: Option<String>,
    pub city: Option<String>,
    pub device_type: Option<String>,
    pub browser: Option<String>,
    pub os: Option<String>,
    pub is_unique: bool,
    pub session_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RecordClickRequest {
    pub link_code: String,
    pub ip_address: String,
    pub user_agent: Option<String>,
    pub referer: Option<String>,
}
