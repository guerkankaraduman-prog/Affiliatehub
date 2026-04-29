use crate::utils::errors::AppError;

pub fn validate_uuid(id: &str) -> Result<uuid::Uuid, AppError> {
    uuid::Uuid::parse_str(id).map_err(|_| AppError::Validation(format!("Invalid UUID: {}", id)))
}

pub fn validate_rating(rating: i32) -> Result<(), AppError> {
    if !(1..=5).contains(&rating) {
        return Err(AppError::Validation(
            "Rating must be between 1 and 5".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_email(email: &str) -> Result<(), AppError> {
    if !email.contains('@') || !email.contains('.') {
        return Err(AppError::Validation("Invalid email address".to_string()));
    }
    Ok(())
}

pub fn validate_not_empty(field: &str, name: &str) -> Result<(), AppError> {
    if field.trim().is_empty() {
        return Err(AppError::Validation(format!("{} cannot be empty", name)));
    }
    Ok(())
}

pub fn validate_positive_amount(amount: f64, name: &str) -> Result<(), AppError> {
    if amount <= 0.0 {
        return Err(AppError::Validation(format!(
            "{} must be greater than 0",
            name
        )));
    }
    Ok(())
}

pub fn validate_commission_rate(rate: f64) -> Result<(), AppError> {
    if rate < 0.0 || rate > 100.0 {
        return Err(AppError::Validation(
            "Commission rate must be between 0 and 100".to_string(),
        ));
    }
    Ok(())
}

pub fn validate_payout_method(method: &str) -> Result<(), AppError> {
    match method {
        "paypal" | "bank_transfer" | "stripe" => Ok(()),
        _ => Err(AppError::Validation(
            "Invalid payout method. Must be paypal, bank_transfer, or stripe".to_string(),
        )),
    }
}

pub fn validate_sort_order(sort: &str, allowed: &[&str]) -> Result<(), AppError> {
    if !allowed.contains(&sort) {
        return Err(AppError::Validation(format!(
            "Invalid sort_by. Must be one of: {}",
            allowed.join(", ")
        )));
    }
    Ok(())
}
