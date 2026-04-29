use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Review {
    pub id: Uuid,
    pub product_id: Uuid,
    pub user_id: Uuid,
    pub rating: i32,
    pub title: Option<String>,
    pub body: Option<String>,
    pub pros: Option<Vec<String>>,
    pub cons: Option<Vec<String>>,
    pub is_verified_purchase: bool,
    pub is_approved: bool,
    pub helpful_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReview {
    pub rating: i32,
    pub title: Option<String>,
    pub body: Option<String>,
    pub pros: Option<Vec<String>>,
    pub cons: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateReview {
    pub rating: Option<i32>,
    pub title: Option<String>,
    pub body: Option<String>,
    pub pros: Option<Vec<String>>,
    pub cons: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct ReviewQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub rating: Option<i32>,
    pub sort_by: Option<String>,
    pub is_approved: Option<bool>,
    pub product_id: Option<Uuid>,
}

#[derive(Debug, Serialize)]
pub struct ReviewResponse {
    pub id: Uuid,
    pub product_id: Uuid,
    pub user_id: Uuid,
    pub rating: i32,
    pub title: Option<String>,
    pub body: Option<String>,
    pub pros: Option<Vec<String>>,
    pub cons: Option<Vec<String>>,
    pub is_verified_purchase: bool,
    pub is_approved: bool,
    pub helpful_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Review> for ReviewResponse {
    fn from(r: Review) -> Self {
        Self {
            id: r.id,
            product_id: r.product_id,
            user_id: r.user_id,
            rating: r.rating,
            title: r.title,
            body: r.body,
            pros: r.pros,
            cons: r.cons,
            is_verified_purchase: r.is_verified_purchase,
            is_approved: r.is_approved,
            helpful_count: r.helpful_count,
            created_at: r.created_at,
            updated_at: r.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ReviewSummary {
    pub avg_rating: f64,
    pub total_reviews: i64,
    pub distribution: ReviewDistribution,
}

#[derive(Debug, Serialize)]
pub struct ReviewDistribution {
    #[serde(rename = "5")]
    pub five: i64,
    #[serde(rename = "4")]
    pub four: i64,
    #[serde(rename = "3")]
    pub three: i64,
    #[serde(rename = "2")]
    pub two: i64,
    #[serde(rename = "1")]
    pub one: i64,
}

#[derive(Debug, Deserialize)]
pub struct AdminUpdateReview {
    pub is_approved: bool,
}
