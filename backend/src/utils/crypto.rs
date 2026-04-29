use rand::Rng;
use sha2::{Digest, Sha256};

pub fn generate_link_code() -> String {
    let mut rng = rand::thread_rng();
    let bytes: [u8; 6] = rng.gen();
    base62::encode(&bytes)
}

pub fn sha256_hash(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn generate_click_fingerprint(link_id: &str, ip: &str, user_agent: &str) -> String {
    let data = format!("{}:{}:{}", link_id, ip, user_agent);
    sha256_hash(&data)
}

pub fn generate_visitor_id(ip: &str, user_agent: &str) -> String {
    let data = format!("visitor:{}:{}", ip, user_agent);
    sha256_hash(&data)[..16].to_string()
}
