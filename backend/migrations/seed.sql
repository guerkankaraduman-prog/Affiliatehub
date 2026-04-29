-- Seed admin user
INSERT INTO users (id, clerk_id, email, first_name, last_name, role, commission_rate, is_active)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'user_admin_001', 'admin@affiliateplatform.com', 'Platform', 'Admin', 'admin', 10.00, true),
    ('a0000000-0000-0000-0000-000000000002', 'user_merchant_001', 'merchant@example.com', 'Jane', 'Merchant', 'merchant', 10.00, true),
    ('a0000000-0000-0000-0000-000000000003', 'user_affiliate_001', 'affiliate@example.com', 'John', 'Affiliate', 'affiliate', 12.50, true);

-- Seed categories
INSERT INTO categories (id, name, slug, description, icon, sort_order, is_active)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Software', 'software', 'Software products and tools', 'code', 1, true),
    ('b0000000-0000-0000-0000-000000000002', 'Education', 'education', 'Online courses and learning', 'book', 2, true),
    ('b0000000-0000-0000-0000-000000000003', 'SaaS', 'saas', 'Software as a Service', 'cloud', 3, true),
    ('b0000000-0000-0000-0000-000000000004', 'Health & Fitness', 'health-fitness', 'Health and fitness products', 'heart', 4, true);

-- Set SaaS as child of Software
UPDATE categories SET parent_id = 'b0000000-0000-0000-0000-000000000001' WHERE id = 'b0000000-0000-0000-0000-000000000003';

-- Seed products
INSERT INTO products (id, merchant_id, category_id, name, slug, description, short_description, price, sale_price, currency, image_url, external_url, commission_rate, commission_type, tags, is_active, is_featured)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Advanced Rust Programming Course', 'advanced-rust-programming', 'Master Rust programming with this comprehensive course covering ownership, lifetimes, async/await, and building production systems.', 'Learn advanced Rust programming concepts', 99.99, 79.99, 'USD', 'https://images.example.com/rust-course.jpg', 'https://merchant.example.com/rust-course', 15.00, 'percentage', ARRAY['programming', 'rust', 'online-course'], true, true),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'CloudDeploy Pro', 'clouddeploy-pro', 'Streamline your deployments with CloudDeploy Pro. Supports Docker, Kubernetes, and serverless deployments with one click.', 'One-click cloud deployment platform', 29.99, NULL, 'USD', 'https://images.example.com/clouddeploy.jpg', 'https://merchant.example.com/clouddeploy', 20.00, 'percentage', ARRAY['saas', 'devops', 'cloud'], true, true),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'FitTracker Premium', 'fittracker-premium', 'AI-powered fitness tracking app with personalized workout plans, nutrition guidance, and progress analytics.', 'AI fitness tracking and coaching', 14.99, 9.99, 'USD', 'https://images.example.com/fittracker.jpg', 'https://merchant.example.com/fittracker', NULL, 'percentage', ARRAY['fitness', 'health', 'mobile-app'], true, false),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'CodeEditor Ultimate', 'codeeditor-ultimate', 'The most powerful code editor with AI completion, multi-language support, and integrated terminal.', 'AI-powered code editor', 49.99, NULL, 'USD', 'https://images.example.com/codeeditor.jpg', 'https://merchant.example.com/codeeditor', 10.00, 'fixed', ARRAY['software', 'developer-tools', 'ide'], true, false);

-- Seed affiliate links
INSERT INTO affiliate_links (id, affiliate_id, product_id, code, custom_slug, destination_url, total_clicks, unique_clicks, total_conversions, total_revenue, total_commission, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'aB3xK9', 'john-rust-course', 'https://merchant.example.com/rust-course', 350, 280, 12, 959.88, 143.98, true),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'cD5yM2', NULL, 'https://merchant.example.com/clouddeploy', 120, 95, 8, 239.92, 47.98, true);
