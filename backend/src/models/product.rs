use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Uuid,
    pub merchant_id: Uuid,
    pub category_id: Option<Uuid>,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub short_description: Option<String>,
    pub price: sqlx::types::BigDecimal,
    pub sale_price: Option<sqlx::types::BigDecimal>,
    pub currency: String,
    pub image_url: Option<String>,
    pub gallery_urls: Option<Vec<String>>,
    pub external_url: String,
    pub commission_rate: Option<sqlx::types::BigDecimal>,
    pub commission_type: String,
    pub tags: Option<Vec<String>>,
    pub is_active: bool,
    pub is_featured: bool,
    pub total_clicks: i32,
    pub total_conversions: i32,
    pub avg_rating: sqlx::types::BigDecimal,
    pub review_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProduct {
    pub name: String,
    pub description: Option<String>,
    pub short_description: Option<String>,
    pub price: f64,
    pub sale_price: Option<f64>,
    pub currency: Option<String>,
    pub image_url: Option<String>,
    pub gallery_urls: Option<Vec<String>>,
    pub external_url: String,
    pub category_id: Option<Uuid>,
    pub commission_rate: Option<f64>,
    pub commission_type: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_featured: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProduct {
    pub name: Option<String>,
    pub description: Option<String>,
    pub short_description: Option<String>,
    pub price: Option<f64>,
    pub sale_price: Option<f64>,
    pub currency: Option<String>,
    pub image_url: Option<String>,
    pub gallery_urls: Option<Vec<String>>,
    pub external_url: Option<String>,
    pub category_id: Option<Uuid>,
    pub commission_rate: Option<f64>,
    pub commission_type: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_active: Option<bool>,
    pub is_featured: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ProductQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub category_id: Option<Uuid>,
    pub merchant_id: Option<Uuid>,
    pub search: Option<String>,
    pub min_price: Option<f64>,
    pub max_price: Option<f64>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub is_featured: Option<bool>,
    pub tags: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct ProductResponse {
    pub id: Uuid,
    pub merchant_id: Uuid,
    pub category_id: Option<Uuid>,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub short_description: Option<String>,
    pub price: f64,
    pub sale_price: Option<f64>,
    pub currency: String,
    pub image_url: Option<String>,
    pub gallery_urls: Option<Vec<String>>,
    pub external_url: String,
    pub commission_rate: Option<f64>,
    pub commission_type: String,
    pub tags: Option<Vec<String>>,
    pub is_active: bool,
    pub is_featured: bool,
    pub total_clicks: i32,
    pub total_conversions: i32,
    pub avg_rating: f64,
    pub review_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<Product> for ProductResponse {
    fn from(p: Product) -> Self {
        use sqlx::types::BigDecimal;
        use std::str::FromStr;

        let to_f64 = |bd: &BigDecimal| -> f64 {
            f64::from_str(&bd.to_string()).unwrap_or(0.0)
        };

        Self {
            id: p.id,
            merchant_id: p.merchant_id,
            category_id: p.category_id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            short_description: p.short_description,
            price: to_f64(&p.price),
            sale_price: p.sale_price.as_ref().map(|s| to_f64(s)),
            currency: p.currency,
            image_url: p.image_url,
            gallery_urls: p.gallery_urls,
            external_url: p.external_url,
            commission_rate: p.commission_rate.as_ref().map(|c| to_f64(c)),
            commission_type: p.commission_type,
            tags: p.tags,
            is_active: p.is_active,
            is_featured: p.is_featured,
            total_clicks: p.total_clicks,
            total_conversions: p.total_conversions,
            avg_rating: to_f64(&p.avg_rating),
            review_count: p.review_count,
            created_at: p.created_at,
            updated_at: p.updated_at,
        }
    }
}
