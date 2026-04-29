use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub environment: String,
    pub database_url: String,
    pub database_max_connections: u32,
    pub database_min_connections: u32,
    pub clerk_secret_key: String,
    pub clerk_jwks_url: String,
    pub clerk_webhook_secret: String,
    pub clerk_issuer: String,
    pub allowed_origins: Vec<String>,
    pub frontend_url: String,
    pub attribution_window_days: i64,
    pub click_dedup_window_seconds: i64,
    pub cookie_domain: String,
    pub cookie_secure: bool,
    pub default_commission_rate: f64,
    pub auto_approval_days: i64,
    pub min_payout_amount: f64,
    pub rate_limit_anonymous: u32,
    pub rate_limit_authenticated: u32,
    pub rate_limit_tracking: u32,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("PORT must be a number"),
            environment: env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string()),
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            database_max_connections: env::var("DATABASE_MAX_CONNECTIONS")
                .unwrap_or_else(|_| "20".to_string())
                .parse()
                .unwrap_or(20),
            database_min_connections: env::var("DATABASE_MIN_CONNECTIONS")
                .unwrap_or_else(|_| "5".to_string())
                .parse()
                .unwrap_or(5),
            clerk_secret_key: env::var("CLERK_SECRET_KEY").expect("CLERK_SECRET_KEY must be set"),
            clerk_jwks_url: env::var("CLERK_JWKS_URL").expect("CLERK_JWKS_URL must be set"),
            clerk_webhook_secret: env::var("CLERK_WEBHOOK_SECRET")
                .expect("CLERK_WEBHOOK_SECRET must be set"),
            clerk_issuer: env::var("CLERK_ISSUER").expect("CLERK_ISSUER must be set"),
            allowed_origins: env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000".to_string())
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),
            frontend_url: env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            attribution_window_days: env::var("ATTRIBUTION_WINDOW_DAYS")
                .unwrap_or_else(|_| "30".to_string())
                .parse()
                .unwrap_or(30),
            click_dedup_window_seconds: env::var("CLICK_DEDUP_WINDOW_SECONDS")
                .unwrap_or_else(|_| "900".to_string())
                .parse()
                .unwrap_or(900),
            cookie_domain: env::var("COOKIE_DOMAIN").unwrap_or_else(|_| "localhost".to_string()),
            cookie_secure: env::var("COOKIE_SECURE")
                .unwrap_or_else(|_| "false".to_string())
                .parse()
                .unwrap_or(false),
            default_commission_rate: env::var("DEFAULT_COMMISSION_RATE")
                .unwrap_or_else(|_| "10.00".to_string())
                .parse()
                .unwrap_or(10.0),
            auto_approval_days: env::var("AUTO_APPROVAL_DAYS")
                .unwrap_or_else(|_| "14".to_string())
                .parse()
                .unwrap_or(14),
            min_payout_amount: env::var("MIN_PAYOUT_AMOUNT")
                .unwrap_or_else(|_| "50.00".to_string())
                .parse()
                .unwrap_or(50.0),
            rate_limit_anonymous: env::var("RATE_LIMIT_ANONYMOUS")
                .unwrap_or_else(|_| "60".to_string())
                .parse()
                .unwrap_or(60),
            rate_limit_authenticated: env::var("RATE_LIMIT_AUTHENTICATED")
                .unwrap_or_else(|_| "120".to_string())
                .parse()
                .unwrap_or(120),
            rate_limit_tracking: env::var("RATE_LIMIT_TRACKING")
                .unwrap_or_else(|_| "120".to_string())
                .parse()
                .unwrap_or(120),
        }
    }

    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }
}
