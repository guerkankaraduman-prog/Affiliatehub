pub fn slugify(input: &str) -> String {
    input
        .to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() {
                c
            } else if c == ' ' || c == '_' || c == '-' {
                '-'
            } else {
                '\0'
            }
        })
        .filter(|c| *c != '\0')
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<&str>>()
        .join("-")
}

pub fn generate_unique_slug(base: &str, suffix: &str) -> String {
    let slug = slugify(base);
    if suffix.is_empty() {
        slug
    } else {
        format!("{}-{}", slug, suffix)
    }
}
