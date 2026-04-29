use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AffiliateLink {
    pub id: Uuid,
    pub affiliate_id: Uuid,
    pub product_id: Uuid,
    pub code: String,
    pub custom_slug: Option<String>,
    pub destination_url: String,
    pub total_clicks: i32,
    pub unique_clicks: i32,
    pub total_conversions: i32,
    pub total_revenue: sqlx::types::BigDecimal,
    pub total_commission: sqlx::types::BigDecimal,
    pub is_active: bool,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAffiliateLink {
    pub product_id: Uuid,
    pub custom_slug: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAffiliateLink {
    pub custom_slug: Option<String>,
    pub is_active: Option<bool>,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct AffiliateLinkQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub product_id: Option<Uuid>,
    pub is_active: Option<bool>,
    pub sort_by: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AffiliateLinkResponse {
    pub id: Uuid,
    pub affiliate_id: Uuid,
    pub product_id: Uuid,
    pub code: String,
    pub custom_slug: Option<String>,
    pub tracking_url: String,
    pub destination_url: String,
    pub total_clicks: i32,
    pub unique_clicks: i32,
    pub total_conversions: i32,
    pub total_revenue: f64,
    pub total_commission: f64,
    pub is_active: bool,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AffiliateLink {
    pub fn to_response(&self, base_url: &str) -> AffiliateLinkResponse {
        use std::str::FromStr;
        AffiliateLinkResponse {
            id: self.id,
            affiliate_id: self.affiliate_id,
            product_id: self.product_id,
            code: self.code.clone(),
            custom_slug: self.custom_slug.clone(),
            tracking_url: format!("{}/t/{}", base_url, self.code),
            destination_url: self.destination_url.clone(),
            total_clicks: self.total_clicks,
            unique_clicks: self.unique_clicks,
            total_conversions: self.total_conversions,
            total_revenue: f64::from_str(&self.total_revenue.to_string()).unwrap_or(0.0),
            total_commission: f64::from_str(&self.total_commission.to_string()).unwrap_or(0.0),
            is_active: self.is_active,
            expires_at: self.expires_at,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}
