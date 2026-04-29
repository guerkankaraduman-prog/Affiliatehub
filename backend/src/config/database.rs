use sqlx::postgres::{PgPool, PgPoolOptions};
use std::time::Duration;

use super::AppConfig;

#[derive(Debug, Clone)]
pub struct DatabaseConfig;

impl DatabaseConfig {
    pub async fn create_pool(config: &AppConfig) -> PgPool {
        PgPoolOptions::new()
            .max_connections(config.database_max_connections)
            .min_connections(config.database_min_connections)
            .acquire_timeout(Duration::from_secs(10))
            .idle_timeout(Duration::from_secs(600))
            .max_lifetime(Duration::from_secs(1800))
            .connect(&config.database_url)
            .await
            .expect("Failed to create database pool")
    }

    pub async fn run_migrations(pool: &PgPool) {
        sqlx::migrate!("./migrations")
            .run(pool)
            .await
            .expect("Failed to run database migrations");
    }
}
