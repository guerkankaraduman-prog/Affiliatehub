use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub clerk_id: String,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub role: String,
    pub commission_rate: sqlx::types::BigDecimal,
    pub payout_method: Option<String>,
    pub payout_details: Option<serde_json::Value>,
    pub total_earnings: sqlx::types::BigDecimal,
    pub pending_balance: sqlx::types::BigDecimal,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserFromWebhook {
    pub clerk_id: String,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserProfile {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub payout_method: Option<String>,
    pub payout_details: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct AdminUpdateUser {
    pub role: Option<String>,
    pub commission_rate: Option<f64>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub clerk_id: String,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub role: String,
    pub commission_rate: f64,
    pub payout_method: Option<String>,
    pub payout_details: Option<serde_json::Value>,
    pub total_earnings: f64,
    pub pending_balance: f64,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserResponse {
    fn from(u: User) -> Self {
        use sqlx::types::BigDecimal;
        use std::str::FromStr;

        let to_f64 = |bd: &BigDecimal| -> f64 {
            f64::from_str(&bd.to_string()).unwrap_or(0.0)
        };

        Self {
            id: u.id,
            clerk_id: u.clerk_id,
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
            avatar_url: u.avatar_url,
            role: u.role,
            commission_rate: to_f64(&u.commission_rate),
            payout_method: u.payout_method,
            payout_details: u.payout_details,
            total_earnings: to_f64(&u.total_earnings),
            pending_balance: to_f64(&u.pending_balance),
            is_active: u.is_active,
            created_at: u.created_at,
            updated_at: u.updated_at,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct AuthUser {
    pub id: Uuid,
    pub clerk_id: String,
    pub email: String,
    pub role: String,
    pub is_active: bool,
}
