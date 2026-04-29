use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Analytics {
    pub id: Uuid,
    pub affiliate_id: Uuid,
    pub product_id: Option<Uuid>,
    pub link_id: Option<Uuid>,
    pub date: NaiveDate,
    pub clicks: i32,
    pub unique_clicks: i32,
    pub conversions: i32,
    pub revenue: sqlx::types::BigDecimal,
    pub commission: sqlx::types::BigDecimal,
    pub conversion_rate: sqlx::types::BigDecimal,
    pub avg_order_value: sqlx::types::BigDecimal,
    pub top_country: Option<String>,
    pub top_device: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct AnalyticsQuery {
    pub period: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub product_id: Option<Uuid>,
    pub link_id: Option<Uuid>,
    pub group_by: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DashboardStats {
    pub summary: DashboardSummary,
    pub chart_data: ChartData,
    pub top_products: Vec<TopProduct>,
    pub recent_conversions: Vec<RecentConversion>,
}

#[derive(Debug, Serialize)]
pub struct DashboardSummary {
    pub total_clicks: i64,
    pub total_conversions: i64,
    pub conversion_rate: f64,
    pub total_revenue: f64,
    pub total_commission: f64,
    pub clicks_change: f64,
    pub conversions_change: f64,
    pub revenue_change: f64,
}

#[derive(Debug, Serialize)]
pub struct ChartData {
    pub labels: Vec<String>,
    pub clicks: Vec<i64>,
    pub conversions: Vec<i64>,
    pub revenue: Vec<f64>,
}

#[derive(Debug, Serialize)]
pub struct TopProduct {
    pub id: Uuid,
    pub name: String,
    pub clicks: i64,
    pub conversions: i64,
    pub revenue: f64,
}

#[derive(Debug, Serialize)]
pub struct RecentConversion {
    pub id: Uuid,
    pub product_name: String,
    pub amount: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct ClickAnalytics {
    pub total: i64,
    pub unique: i64,
    pub data: Vec<DailyClickData>,
    pub by_country: Vec<CountryData>,
    pub by_device: Vec<DeviceData>,
    pub by_browser: Vec<BrowserData>,
}

#[derive(Debug, Serialize)]
pub struct DailyClickData {
    pub date: String,
    pub clicks: i64,
    pub unique_clicks: i64,
}

#[derive(Debug, Serialize)]
pub struct CountryData {
    pub country: String,
    pub clicks: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize)]
pub struct DeviceData {
    pub device: String,
    pub clicks: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize)]
pub struct BrowserData {
    pub browser: String,
    pub clicks: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize)]
pub struct ConversionAnalytics {
    pub total_conversions: i64,
    pub total_revenue: f64,
    pub total_commission: f64,
    pub conversion_rate: f64,
    pub avg_order_value: f64,
    pub data: Vec<DailyConversionData>,
    pub by_product: Vec<ProductConversionData>,
    pub by_status: StatusBreakdown,
}

#[derive(Debug, Serialize)]
pub struct DailyConversionData {
    pub date: String,
    pub conversions: i64,
    pub revenue: f64,
    pub commission: f64,
}

#[derive(Debug, Serialize)]
pub struct ProductConversionData {
    pub product_id: Uuid,
    pub name: String,
    pub conversions: i64,
    pub revenue: f64,
}

#[derive(Debug, Serialize)]
pub struct StatusBreakdown {
    pub pending: i64,
    pub approved: i64,
    pub rejected: i64,
    pub paid: i64,
}

#[derive(Debug, Serialize)]
pub struct RealtimeStats {
    pub active_visitors: i64,
    pub clicks_last_30min: i64,
    pub conversions_last_30min: i64,
    pub revenue_last_30min: f64,
    pub live_clicks: Vec<LiveClick>,
}

#[derive(Debug, Serialize)]
pub struct LiveClick {
    pub country: Option<String>,
    pub product: String,
    pub device: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct AdminStats {
    pub total_users: i64,
    pub total_affiliates: i64,
    pub total_merchants: i64,
    pub total_products: i64,
    pub total_active_links: i64,
    pub total_clicks_all_time: i64,
    pub total_conversions_all_time: i64,
    pub total_revenue_all_time: f64,
    pub total_commissions_paid: f64,
    pub pending_payouts: f64,
    pub monthly_stats: Vec<MonthlyStats>,
}

#[derive(Debug, Serialize)]
pub struct MonthlyStats {
    pub month: String,
    pub clicks: i64,
    pub conversions: i64,
    pub revenue: f64,
}

#[derive(Debug, Deserialize)]
pub struct ExportQuery {
    pub export_type: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub format: Option<String>,
}
