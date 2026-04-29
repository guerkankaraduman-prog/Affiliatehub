# Affiliate Marketing Platform — Architecture Plan

## Overview

A full-stack affiliate marketing platform enabling merchants to list products, affiliates to generate tracking links, and admins to manage payouts. Built with Next.js 15 (frontend), Rust/Axum (backend), PostgreSQL (database), Clerk (auth), and PostHog (analytics).

---

## 1. Database Schema

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'affiliate' CHECK (role IN ('admin', 'merchant', 'affiliate')),
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    payout_method VARCHAR(50) CHECK (payout_method IN ('paypal', 'bank_transfer', 'stripe')),
    payout_details JSONB,
    total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pending_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    icon VARCHAR(50),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    image_url TEXT,
    gallery_urls TEXT[],
    external_url TEXT NOT NULL,
    commission_rate DECIMAL(5,2),
    commission_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    tags TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    total_conversions INTEGER NOT NULL DEFAULT 0,
    avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- AFFILIATE LINKS
-- ============================================================
CREATE TABLE affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL UNIQUE,
    custom_slug VARCHAR(100) UNIQUE,
    destination_url TEXT NOT NULL,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    unique_clicks INTEGER NOT NULL DEFAULT 0,
    total_conversions INTEGER NOT NULL DEFAULT 0,
    total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_commission DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(affiliate_id, product_id)
);

CREATE INDEX idx_affiliate_links_affiliate ON affiliate_links(affiliate_id);
CREATE INDEX idx_affiliate_links_product ON affiliate_links(product_id);
CREATE INDEX idx_affiliate_links_code ON affiliate_links(code);
CREATE INDEX idx_affiliate_links_custom_slug ON affiliate_links(custom_slug) WHERE custom_slug IS NOT NULL;

-- ============================================================
-- CLICKS
-- ============================================================
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
    affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser VARCHAR(50),
    os VARCHAR(50),
    is_unique BOOLEAN NOT NULL DEFAULT true,
    session_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clicks_link ON clicks(link_id);
CREATE INDEX idx_clicks_affiliate ON clicks(affiliate_id);
CREATE INDEX idx_clicks_product ON clicks(product_id);
CREATE INDEX idx_clicks_created ON clicks(created_at);
CREATE INDEX idx_clicks_session ON clicks(session_id);
CREATE INDEX idx_clicks_dedup ON clicks(link_id, ip_address, user_agent, created_at);

-- Partition clicks by month for performance
-- CREATE TABLE clicks_y2024m01 PARTITION OF clicks FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ============================================================
-- SESSIONS (Attribution tracking)
-- ============================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id VARCHAR(64) NOT NULL,
    affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    landing_page TEXT,
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    country VARCHAR(2),
    device_type VARCHAR(20),
    first_click_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_click_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    converted BOOLEAN NOT NULL DEFAULT false,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_visitor ON sessions(visitor_id);
CREATE INDEX idx_sessions_affiliate ON sessions(affiliate_id);
CREATE INDEX idx_sessions_link ON sessions(link_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_converted ON sessions(converted) WHERE converted = false;

-- ============================================================
-- CONVERSIONS
-- ============================================================
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    click_id UUID REFERENCES clicks(id) ON DELETE SET NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
    affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id VARCHAR(255),
    order_amount DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('percentage', 'fixed')),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    rejection_reason TEXT,
    ip_address INET,
    metadata JSONB,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversions_affiliate ON conversions(affiliate_id);
CREATE INDEX idx_conversions_product ON conversions(product_id);
CREATE INDEX idx_conversions_link ON conversions(link_id);
CREATE INDEX idx_conversions_session ON conversions(session_id);
CREATE INDEX idx_conversions_status ON conversions(status);
CREATE INDEX idx_conversions_created ON conversions(created_at);
CREATE INDEX idx_conversions_order ON conversions(order_id);

-- ============================================================
-- PAYOUTS
-- ============================================================
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    method VARCHAR(50) NOT NULL CHECK (method IN ('paypal', 'bank_transfer', 'stripe')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transaction_id VARCHAR(255),
    payout_details JSONB,
    notes TEXT,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    conversions_count INTEGER NOT NULL DEFAULT 0,
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_affiliate ON payouts(affiliate_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created ON payouts(created_at);

-- ============================================================
-- ANALYTICS (Pre-aggregated daily stats)
-- ============================================================
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    unique_clicks INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    commission DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    avg_order_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    top_country VARCHAR(2),
    top_device VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(affiliate_id, product_id, link_id, date)
);

CREATE INDEX idx_analytics_affiliate_date ON analytics(affiliate_id, date);
CREATE INDEX idx_analytics_product_date ON analytics(product_id, date);
CREATE INDEX idx_analytics_link_date ON analytics(link_id, date);
CREATE INDEX idx_analytics_date ON analytics(date);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    body TEXT,
    pros TEXT[],
    cons TEXT[],
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(product_id, rating);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON affiliate_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversions_updated_at BEFORE UPDATE ON conversions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update product avg_rating on review insert/update
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products SET
        avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_product_rating();
```

---

## 2. API Endpoints

Base URL: `https://api.affiliateplatform.com/v1`

All authenticated endpoints require `Authorization: Bearer <clerk_jwt>` header.

### 2.1 Auth Endpoints

#### `POST /auth/webhook`
Clerk webhook handler for user sync.
- **Auth**: Clerk Webhook Signature (Svix)
- **Request**: Clerk webhook payload
```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc...",
    "email_addresses": [{"email_address": "user@example.com"}],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://..."
  }
}
```
- **Response** `200`:
```json
{ "success": true }
```

#### `GET /auth/me`
Get current authenticated user profile.
- **Auth**: Required (any role)
- **Response** `200`:
```json
{
  "id": "uuid",
  "clerk_id": "user_2abc...",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://...",
  "role": "affiliate",
  "commission_rate": 10.00,
  "total_earnings": 1500.00,
  "pending_balance": 250.00,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `PUT /auth/me`
Update current user profile.
- **Auth**: Required (any role)
- **Request**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "payout_method": "paypal",
  "payout_details": { "email": "john@paypal.com" }
}
```
- **Response** `200`:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "payout_method": "paypal",
  "payout_details": { "email": "john@paypal.com" },
  "updated_at": "2024-01-15T10:35:00Z"
}
```

---

### 2.2 Product Endpoints

#### `GET /products`
List products with filtering, search, and pagination.
- **Auth**: Optional (public)
- **Query Params**: `page`, `per_page`, `category_id`, `merchant_id`, `search`, `min_price`, `max_price`, `sort_by` (price|created_at|rating|popularity), `sort_order` (asc|desc), `is_featured`, `tags`
- **Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Premium Course",
      "slug": "premium-course",
      "short_description": "Learn advanced...",
      "price": 99.99,
      "sale_price": 79.99,
      "currency": "USD",
      "image_url": "https://...",
      "category": { "id": "uuid", "name": "Education", "slug": "education" },
      "merchant": { "id": "uuid", "first_name": "Jane", "last_name": "Merchant" },
      "commission_rate": 15.00,
      "commission_type": "percentage",
      "avg_rating": 4.5,
      "review_count": 28,
      "total_clicks": 1500,
      "is_featured": true,
      "tags": ["online-course", "programming"],
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### `GET /products/:id`
Get single product detail.
- **Auth**: Optional (public)
- **Response** `200`:
```json
{
  "id": "uuid",
  "name": "Premium Course",
  "slug": "premium-course",
  "description": "Full description with markdown...",
  "short_description": "Learn advanced...",
  "price": 99.99,
  "sale_price": 79.99,
  "currency": "USD",
  "image_url": "https://...",
  "gallery_urls": ["https://..."],
  "external_url": "https://merchant.com/product",
  "category": { "id": "uuid", "name": "Education", "slug": "education" },
  "merchant": { "id": "uuid", "first_name": "Jane", "last_name": "Merchant" },
  "commission_rate": 15.00,
  "commission_type": "percentage",
  "avg_rating": 4.5,
  "review_count": 28,
  "total_clicks": 1500,
  "total_conversions": 45,
  "is_active": true,
  "is_featured": true,
  "tags": ["online-course", "programming"],
  "created_at": "2024-01-10T08:00:00Z"
}
```

#### `POST /products`
Create a new product.
- **Auth**: Required (merchant, admin)
- **Request**:
```json
{
  "name": "Premium Course",
  "description": "Full markdown description...",
  "short_description": "Learn advanced techniques",
  "price": 99.99,
  "sale_price": 79.99,
  "currency": "USD",
  "image_url": "https://...",
  "gallery_urls": ["https://..."],
  "external_url": "https://merchant.com/product",
  "category_id": "uuid",
  "commission_rate": 15.00,
  "commission_type": "percentage",
  "tags": ["online-course", "programming"],
  "is_featured": false
}
```
- **Response** `201`: Full product object (same as GET /products/:id)

#### `PUT /products/:id`
Update a product.
- **Auth**: Required (owner merchant, admin)
- **Request**: Same as POST (all fields optional)
- **Response** `200`: Updated product object

#### `DELETE /products/:id`
Soft-delete a product (sets is_active = false).
- **Auth**: Required (owner merchant, admin)
- **Response** `204`: No content

#### `GET /products/:id/reviews`
Get reviews for a product.
- **Auth**: Optional (public)
- **Query Params**: `page`, `per_page`, `rating`, `sort_by` (created_at|rating|helpful)
- **Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "user": { "id": "uuid", "first_name": "John", "avatar_url": "https://..." },
      "rating": 5,
      "title": "Excellent course!",
      "body": "Learned so much...",
      "pros": ["Well structured", "Great examples"],
      "cons": ["Could be longer"],
      "is_verified_purchase": true,
      "helpful_count": 12,
      "created_at": "2024-02-01T14:00:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 10, "total": 28, "total_pages": 3 },
  "summary": {
    "avg_rating": 4.5,
    "total_reviews": 28,
    "distribution": { "5": 15, "4": 8, "3": 3, "2": 1, "1": 1 }
  }
}
```

#### `POST /products/:id/reviews`
Submit a review for a product.
- **Auth**: Required (any role)
- **Request**:
```json
{
  "rating": 5,
  "title": "Excellent course!",
  "body": "Learned so much from this...",
  "pros": ["Well structured", "Great examples"],
  "cons": ["Could be longer"]
}
```
- **Response** `201`: Created review object

#### `PUT /products/:product_id/reviews/:review_id`
Update own review.
- **Auth**: Required (review owner, admin)
- **Request**: Same as POST (all fields optional)
- **Response** `200`: Updated review object

#### `DELETE /products/:product_id/reviews/:review_id`
Delete own review.
- **Auth**: Required (review owner, admin)
- **Response** `204`: No content

---

### 2.3 Affiliate Endpoints

#### `POST /affiliates/links`
Generate an affiliate link for a product.
- **Auth**: Required (affiliate)
- **Request**:
```json
{
  "product_id": "uuid",
  "custom_slug": "my-custom-link"
}
```
- **Response** `201`:
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "code": "aF7kX9",
  "custom_slug": "my-custom-link",
  "tracking_url": "https://api.affiliateplatform.com/t/aF7kX9",
  "destination_url": "https://merchant.com/product",
  "product": { "id": "uuid", "name": "Premium Course", "image_url": "https://..." },
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `GET /affiliates/links`
List affiliate's links.
- **Auth**: Required (affiliate)
- **Query Params**: `page`, `per_page`, `product_id`, `is_active`, `sort_by` (created_at|clicks|conversions|revenue)
- **Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "aF7kX9",
      "custom_slug": "my-custom-link",
      "tracking_url": "https://api.affiliateplatform.com/t/aF7kX9",
      "destination_url": "https://merchant.com/product",
      "product": { "id": "uuid", "name": "Premium Course", "image_url": "https://..." },
      "total_clicks": 350,
      "unique_clicks": 280,
      "total_conversions": 12,
      "total_revenue": 959.88,
      "total_commission": 143.98,
      "is_active": true,
      "expires_at": null,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 5, "total_pages": 1 }
}
```

#### `GET /affiliates/links/:id`
Get single link details with stats.
- **Auth**: Required (link owner)
- **Response** `200`: Full link object with stats

#### `PUT /affiliates/links/:id`
Update an affiliate link.
- **Auth**: Required (link owner)
- **Request**:
```json
{
  "custom_slug": "new-slug",
  "is_active": true,
  "expires_at": "2025-12-31T23:59:59Z"
}
```
- **Response** `200`: Updated link object

#### `DELETE /affiliates/links/:id`
Deactivate an affiliate link.
- **Auth**: Required (link owner)
- **Response** `204`: No content

#### `GET /affiliates/stats`
Get affiliate dashboard stats summary.
- **Auth**: Required (affiliate)
- **Query Params**: `period` (today|7d|30d|90d|all), `start_date`, `end_date`
- **Response** `200`:
```json
{
  "total_clicks": 5000,
  "unique_clicks": 3800,
  "total_conversions": 150,
  "conversion_rate": 3.95,
  "total_revenue": 12500.00,
  "total_commission": 1875.00,
  "pending_commission": 250.00,
  "avg_order_value": 83.33,
  "top_products": [
    { "product_id": "uuid", "name": "Course A", "clicks": 1200, "conversions": 45, "commission": 675.00 }
  ],
  "top_countries": [
    { "country": "US", "clicks": 2500, "conversions": 80 }
  ],
  "daily_stats": [
    { "date": "2024-01-15", "clicks": 120, "conversions": 5, "commission": 75.00 }
  ]
}
```

#### `GET /affiliates/conversions`
List affiliate's conversions.
- **Auth**: Required (affiliate)
- **Query Params**: `page`, `per_page`, `status` (pending|approved|rejected|paid), `start_date`, `end_date`, `product_id`
- **Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "product": { "id": "uuid", "name": "Premium Course", "image_url": "https://..." },
      "order_id": "ORD-12345",
      "order_amount": 99.99,
      "commission_amount": 15.00,
      "commission_rate": 15.00,
      "status": "approved",
      "created_at": "2024-01-20T14:30:00Z",
      "approved_at": "2024-01-22T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 150, "total_pages": 8 },
  "summary": {
    "total_pending": 250.00,
    "total_approved": 1500.00,
    "total_paid": 5000.00,
    "total_rejected": 50.00
  }
}
```

#### `GET /affiliates/payouts`
List affiliate's payouts.
- **Auth**: Required (affiliate)
- **Query Params**: `page`, `per_page`, `status`
- **Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 500.00,
      "currency": "USD",
      "method": "paypal",
      "status": "completed",
      "transaction_id": "PAY-abc123",
      "period_start": "2024-01-01T00:00:00Z",
      "period_end": "2024-01-31T23:59:59Z",
      "conversions_count": 35,
      "completed_at": "2024-02-05T10:00:00Z",
      "created_at": "2024-02-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 12, "total_pages": 1 }
}
```

#### `POST /affiliates/payouts/request`
Request a payout.
- **Auth**: Required (affiliate)
- **Request**:
```json
{
  "amount": 500.00,
  "method": "paypal"
}
```
- **Response** `201`: Created payout object

---

### 2.4 Tracking Endpoints

#### `GET /t/:code`
Track click and redirect to destination.
- **Auth**: None (public)
- **Behavior**: Records click, sets attribution cookie (30 days), redirects 302 to destination URL.
- **Response**: `302 Redirect` with `Set-Cookie: _aff_id=<session_id>; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax`

#### `POST /track/conversion`
Record a conversion (called by merchant webhook/pixel).
- **Auth**: API key (merchant)
- **Request**:
```json
{
  "order_id": "ORD-12345",
  "order_amount": 99.99,
  "currency": "USD",
  "product_id": "uuid",
  "customer_ip": "1.2.3.4",
  "session_id": "uuid",
  "metadata": { "customer_email": "buyer@example.com" }
}
```
- **Response** `201`:
```json
{
  "conversion_id": "uuid",
  "affiliate_id": "uuid",
  "commission_amount": 15.00,
  "status": "pending"
}
```

#### `POST /track/postback`
Server-to-server postback for conversion tracking.
- **Auth**: API key (merchant)
- **Request**:
```json
{
  "click_id": "uuid",
  "order_id": "ORD-12345",
  "amount": 99.99,
  "currency": "USD",
  "status": "completed"
}
```
- **Response** `200`:
```json
{ "success": true, "conversion_id": "uuid" }
```

#### `GET /track/pixel.gif`
1x1 tracking pixel for conversion attribution.
- **Auth**: None
- **Query Params**: `sid` (session_id), `oid` (order_id), `amt` (amount), `pid` (product_id)
- **Response**: 1x1 transparent GIF with conversion recorded

---

### 2.5 Analytics Endpoints

#### `GET /analytics/dashboard`
Get dashboard overview data.
- **Auth**: Required (affiliate, merchant, admin)
- **Query Params**: `period` (today|7d|30d|90d|custom), `start_date`, `end_date`
- **Response** `200`:
```json
{
  "summary": {
    "total_clicks": 5000,
    "total_conversions": 150,
    "conversion_rate": 3.0,
    "total_revenue": 12500.00,
    "total_commission": 1875.00,
    "clicks_change": 12.5,
    "conversions_change": -3.2,
    "revenue_change": 8.7
  },
  "chart_data": {
    "labels": ["2024-01-01", "2024-01-02"],
    "clicks": [120, 135],
    "conversions": [4, 6],
    "revenue": [332.00, 498.00]
  },
  "top_products": [
    { "id": "uuid", "name": "Course A", "clicks": 1200, "conversions": 45, "revenue": 3600.00 }
  ],
  "recent_conversions": [
    { "id": "uuid", "product_name": "Course A", "amount": 15.00, "status": "pending", "created_at": "..." }
  ]
}
```

#### `GET /analytics/clicks`
Detailed click analytics.
- **Auth**: Required (affiliate, merchant, admin)
- **Query Params**: `period`, `start_date`, `end_date`, `product_id`, `link_id`, `group_by` (day|week|month|country|device|browser)
- **Response** `200`:
```json
{
  "total": 5000,
  "unique": 3800,
  "data": [
    { "date": "2024-01-15", "clicks": 120, "unique_clicks": 95 }
  ],
  "by_country": [
    { "country": "US", "clicks": 2500, "percentage": 50.0 }
  ],
  "by_device": [
    { "device": "desktop", "clicks": 3000, "percentage": 60.0 }
  ],
  "by_browser": [
    { "browser": "Chrome", "clicks": 2800, "percentage": 56.0 }
  ]
}
```

#### `GET /analytics/conversions`
Detailed conversion analytics.
- **Auth**: Required (affiliate, merchant, admin)
- **Query Params**: `period`, `start_date`, `end_date`, `product_id`, `link_id`, `status`
- **Response** `200`:
```json
{
  "total_conversions": 150,
  "total_revenue": 12500.00,
  "total_commission": 1875.00,
  "conversion_rate": 3.0,
  "avg_order_value": 83.33,
  "data": [
    { "date": "2024-01-15", "conversions": 5, "revenue": 415.00, "commission": 62.25 }
  ],
  "by_product": [
    { "product_id": "uuid", "name": "Course A", "conversions": 45, "revenue": 3600.00 }
  ],
  "by_status": {
    "pending": 10,
    "approved": 120,
    "rejected": 5,
    "paid": 15
  }
}
```

#### `GET /analytics/export`
Export analytics data as CSV.
- **Auth**: Required (affiliate, admin)
- **Query Params**: `type` (clicks|conversions|payouts), `start_date`, `end_date`, `format` (csv|json)
- **Response** `200`: CSV file download or JSON array

#### `GET /analytics/realtime`
Real-time stats (last 30 minutes).
- **Auth**: Required (affiliate, merchant, admin)
- **Response** `200`:
```json
{
  "active_visitors": 23,
  "clicks_last_30min": 45,
  "conversions_last_30min": 2,
  "revenue_last_30min": 166.00,
  "live_clicks": [
    { "country": "US", "product": "Course A", "device": "mobile", "timestamp": "2024-01-15T10:29:45Z" }
  ]
}
```

---

### 2.6 Admin Endpoints

#### `GET /admin/users`
List all users with filtering.
- **Auth**: Required (admin)
- **Query Params**: `page`, `per_page`, `role`, `is_active`, `search`, `sort_by`
- **Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "affiliate",
      "commission_rate": 10.00,
      "total_earnings": 1500.00,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 500, "total_pages": 25 }
}
```

#### `PUT /admin/users/:id`
Update user (role, commission, status).
- **Auth**: Required (admin)
- **Request**:
```json
{
  "role": "merchant",
  "commission_rate": 12.50,
  "is_active": true
}
```
- **Response** `200`: Updated user object

#### `DELETE /admin/users/:id`
Deactivate a user.
- **Auth**: Required (admin)
- **Response** `204`: No content

#### `GET /admin/products`
List all products (including inactive).
- **Auth**: Required (admin)
- **Query Params**: Same as GET /products + `is_active`
- **Response** `200`: Same as GET /products

#### `PUT /admin/products/:id`
Admin update any product.
- **Auth**: Required (admin)
- **Request**: Same as PUT /products/:id + `is_featured`
- **Response** `200`: Updated product

#### `GET /admin/conversions`
List all conversions platform-wide.
- **Auth**: Required (admin)
- **Query Params**: `page`, `per_page`, `status`, `affiliate_id`, `product_id`, `start_date`, `end_date`
- **Response** `200`: Same structure as affiliate conversions

#### `PUT /admin/conversions/:id`
Approve or reject a conversion.
- **Auth**: Required (admin)
- **Request**:
```json
{
  "status": "approved",
  "rejection_reason": null
}
```
- **Response** `200`: Updated conversion

#### `GET /admin/payouts`
List all payouts.
- **Auth**: Required (admin)
- **Query Params**: `page`, `per_page`, `status`, `affiliate_id`, `method`
- **Response** `200`: Same structure as affiliate payouts

#### `PUT /admin/payouts/:id`
Process or update payout status.
- **Auth**: Required (admin)
- **Request**:
```json
{
  "status": "completed",
  "transaction_id": "PAY-abc123"
}
```
- **Response** `200`: Updated payout

#### `POST /admin/payouts/batch`
Create batch payouts for all eligible affiliates.
- **Auth**: Required (admin)
- **Request**:
```json
{
  "min_amount": 50.00,
  "period_start": "2024-01-01T00:00:00Z",
  "period_end": "2024-01-31T23:59:59Z"
}
```
- **Response** `201`:
```json
{
  "payouts_created": 15,
  "total_amount": 7500.00,
  "payouts": [ { "id": "uuid", "affiliate_id": "uuid", "amount": 500.00 } ]
}
```

#### `GET /admin/stats`
Platform-wide statistics.
- **Auth**: Required (admin)
- **Response** `200`:
```json
{
  "total_users": 500,
  "total_affiliates": 350,
  "total_merchants": 50,
  "total_products": 200,
  "total_active_links": 1200,
  "total_clicks_all_time": 500000,
  "total_conversions_all_time": 15000,
  "total_revenue_all_time": 1250000.00,
  "total_commissions_paid": 187500.00,
  "pending_payouts": 12500.00,
  "monthly_stats": [
    { "month": "2024-01", "clicks": 50000, "conversions": 1500, "revenue": 125000.00 }
  ]
}
```

#### `GET /admin/reviews`
Moderate reviews.
- **Auth**: Required (admin)
- **Query Params**: `page`, `per_page`, `is_approved`, `product_id`
- **Response** `200`: List of reviews

#### `PUT /admin/reviews/:id`
Approve/reject review.
- **Auth**: Required (admin)
- **Request**:
```json
{ "is_approved": true }
```
- **Response** `200`: Updated review

---

### 2.7 Category Endpoints

#### `GET /categories`
List all categories (tree structure).
- **Auth**: Optional (public)
- **Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Software",
      "slug": "software",
      "description": "Software products",
      "icon": "code",
      "sort_order": 1,
      "children": [
        { "id": "uuid", "name": "SaaS", "slug": "saas", "description": "...", "icon": "cloud", "sort_order": 1 }
      ],
      "product_count": 45
    }
  ]
}
```

#### `GET /categories/:id`
Get single category with products.
- **Auth**: Optional (public)
- **Response** `200`: Category object with nested products (paginated)

#### `POST /categories`
Create a category.
- **Auth**: Required (admin)
- **Request**:
```json
{
  "name": "Software",
  "description": "Software products and tools",
  "parent_id": null,
  "icon": "code",
  "sort_order": 1
}
```
- **Response** `201`: Created category

#### `PUT /categories/:id`
Update a category.
- **Auth**: Required (admin)
- **Request**: Same as POST (all fields optional)
- **Response** `200`: Updated category

#### `DELETE /categories/:id`
Delete a category (reassigns products to parent or uncategorized).
- **Auth**: Required (admin)
- **Response** `204`: No content

---

## 3. Project Directory Structure

```
affiliate-platform/
├── PLAN.md
├── README.md
│
├── backend/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── .env.example
│   ├── Dockerfile
│   ├── fly.toml
│   ├── sqlx-data.json
│   │
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_categories.sql
│   │   ├── 003_create_products.sql
│   │   ├── 004_create_affiliate_links.sql
│   │   ├── 005_create_clicks.sql
│   │   ├── 006_create_sessions.sql
│   │   ├── 007_create_conversions.sql
│   │   ├── 008_create_payouts.sql
│   │   ├── 009_create_analytics.sql
│   │   └── 010_create_reviews.sql
│   │
│   └── src/
│       ├── main.rs                    # Entry point, server setup
│       ├── lib.rs                     # App state, shared types
│       │
│       ├── config/
│       │   ├── mod.rs
│       │   ├── app.rs                 # App configuration struct
│       │   └── database.rs            # Database pool configuration
│       │
│       ├── db/
│       │   ├── mod.rs
│       │   ├── pool.rs                # SQLx pool creation
│       │   ├── users.rs               # User queries
│       │   ├── products.rs            # Product queries
│       │   ├── categories.rs          # Category queries
│       │   ├── affiliate_links.rs     # Link queries
│       │   ├── clicks.rs              # Click queries
│       │   ├── sessions.rs            # Session queries
│       │   ├── conversions.rs         # Conversion queries
│       │   ├── payouts.rs             # Payout queries
│       │   ├── analytics.rs           # Analytics queries
│       │   └── reviews.rs             # Review queries
│       │
│       ├── models/
│       │   ├── mod.rs
│       │   ├── user.rs                # User struct + DTOs
│       │   ├── product.rs             # Product struct + DTOs
│       │   ├── category.rs            # Category struct + DTOs
│       │   ├── affiliate_link.rs      # AffiliateLink struct + DTOs
│       │   ├── click.rs               # Click struct + DTOs
│       │   ├── session.rs             # Session struct + DTOs
│       │   ├── conversion.rs          # Conversion struct + DTOs
│       │   ├── payout.rs              # Payout struct + DTOs
│       │   ├── analytics.rs           # Analytics struct + DTOs
│       │   └── review.rs              # Review struct + DTOs
│       │
│       ├── handlers/
│       │   ├── mod.rs
│       │   ├── auth.rs                # Webhook handler, /auth/me
│       │   ├── products.rs            # Product CRUD handlers
│       │   ├── categories.rs          # Category CRUD handlers
│       │   ├── affiliates.rs          # Link generation, stats
│       │   ├── tracking.rs            # Click tracking, conversions
│       │   ├── analytics.rs           # Dashboard, charts, export
│       │   ├── admin.rs               # Admin management handlers
│       │   └── reviews.rs             # Review handlers
│       │
│       ├── routes/
│       │   ├── mod.rs                 # Router composition
│       │   ├── auth.rs                # /auth/* routes
│       │   ├── products.rs            # /products/* routes
│       │   ├── categories.rs          # /categories/* routes
│       │   ├── affiliates.rs          # /affiliates/* routes
│       │   ├── tracking.rs            # /t/*, /track/* routes
│       │   ├── analytics.rs           # /analytics/* routes
│       │   └── admin.rs               # /admin/* routes
│       │
│       ├── middleware/
│       │   ├── mod.rs
│       │   ├── auth.rs                # Clerk JWT verification
│       │   ├── rate_limit.rs          # Token bucket rate limiter
│       │   ├── cors.rs                # CORS configuration
│       │   ├── logging.rs             # Request/response logging
│       │   └── error.rs               # Error handling middleware
│       │
│       ├── services/
│       │   ├── mod.rs
│       │   ├── tracking.rs            # Click dedup, session management
│       │   ├── attribution.rs         # Cookie-based attribution logic
│       │   ├── commission.rs          # Commission calculation
│       │   ├── payout.rs              # Payout processing logic
│       │   ├── analytics.rs           # Analytics aggregation
│       │   ├── geo.rs                 # IP geolocation lookup
│       │   └── link_generator.rs      # Unique code generation
│       │
│       └── utils/
│           ├── mod.rs
│           ├── errors.rs              # AppError enum, Into<Response>
│           ├── pagination.rs          # Pagination helpers
│           ├── validation.rs          # Input validation
│           ├── slug.rs                # Slug generation
│           └── crypto.rs              # Hashing, token generation
│
├── frontend/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── .env.local.example
│   ├── middleware.ts                  # Clerk auth middleware
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── images/
│   │
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Landing page
│   │   ├── globals.css                # Tailwind imports + custom styles
│   │   │
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   │
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx             # Marketing layout (header/footer)
│   │   │   ├── about/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx             # Dashboard layout (sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Main dashboard overview
│   │   │   ├── products/
│   │   │   │   ├── page.tsx           # Browse products
│   │   │   │   └── [id]/page.tsx      # Product detail
│   │   │   ├── links/
│   │   │   │   ├── page.tsx           # My affiliate links
│   │   │   │   └── [id]/page.tsx      # Link detail + stats
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx           # Analytics overview
│   │   │   │   ├── clicks/page.tsx    # Click analytics
│   │   │   │   └── conversions/page.tsx # Conversion analytics
│   │   │   ├── conversions/
│   │   │   │   └── page.tsx           # My conversions list
│   │   │   ├── payouts/
│   │   │   │   └── page.tsx           # Payout history + request
│   │   │   └── settings/
│   │   │       └── page.tsx           # Profile + payout settings
│   │   │
│   │   ├── (merchant)/
│   │   │   ├── layout.tsx             # Merchant layout
│   │   │   ├── merchant/
│   │   │   │   └── page.tsx           # Merchant dashboard
│   │   │   ├── merchant/products/
│   │   │   │   ├── page.tsx           # My products
│   │   │   │   ├── new/page.tsx       # Create product
│   │   │   │   └── [id]/edit/page.tsx # Edit product
│   │   │   └── merchant/conversions/
│   │   │       └── page.tsx           # Product conversions
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx             # Admin layout
│   │   │   ├── admin/
│   │   │   │   └── page.tsx           # Admin overview
│   │   │   ├── admin/users/
│   │   │   │   ├── page.tsx           # User management
│   │   │   │   └── [id]/page.tsx      # User detail
│   │   │   ├── admin/products/
│   │   │   │   └── page.tsx           # Product moderation
│   │   │   ├── admin/conversions/
│   │   │   │   └── page.tsx           # Conversion approval
│   │   │   ├── admin/payouts/
│   │   │   │   └── page.tsx           # Payout management
│   │   │   ├── admin/categories/
│   │   │   │   └── page.tsx           # Category management
│   │   │   ├── admin/reviews/
│   │   │   │   └── page.tsx           # Review moderation
│   │   │   └── admin/settings/
│   │   │       └── page.tsx           # Platform settings
│   │   │
│   │   └── api/
│   │       └── webhooks/
│   │           └── clerk/route.ts     # Clerk webhook forwarding
│   │
│   ├── components/
│   │   ├── ui/                        # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── chart.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── header.tsx             # Public header
│   │   │   ├── footer.tsx             # Public footer
│   │   │   ├── sidebar.tsx            # Dashboard sidebar
│   │   │   ├── mobile-nav.tsx         # Mobile navigation
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx        # KPI stat cards
│   │   │   ├── revenue-chart.tsx      # Revenue line chart
│   │   │   ├── clicks-chart.tsx       # Clicks bar chart
│   │   │   ├── conversion-chart.tsx   # Conversion funnel
│   │   │   ├── top-products.tsx       # Top products table
│   │   │   ├── recent-activity.tsx    # Activity feed
│   │   │   └── geo-map.tsx            # Geographic heatmap
│   │   │
│   │   ├── products/
│   │   │   ├── product-card.tsx       # Product grid card
│   │   │   ├── product-grid.tsx       # Product grid layout
│   │   │   ├── product-filters.tsx    # Filter sidebar
│   │   │   ├── product-search.tsx     # Search input
│   │   │   ├── product-form.tsx       # Create/edit form
│   │   │   └── product-reviews.tsx    # Reviews section
│   │   │
│   │   ├── links/
│   │   │   ├── link-card.tsx          # Link list card
│   │   │   ├── link-generator.tsx     # Link creation form
│   │   │   ├── link-stats.tsx         # Link statistics
│   │   │   └── copy-button.tsx        # Copy to clipboard
│   │   │
│   │   ├── analytics/
│   │   │   ├── date-range-picker.tsx  # Date range selector
│   │   │   ├── metric-card.tsx        # Metric display card
│   │   │   ├── line-chart.tsx         # Line chart wrapper
│   │   │   ├── bar-chart.tsx          # Bar chart wrapper
│   │   │   ├── pie-chart.tsx          # Pie chart wrapper
│   │   │   └── data-table.tsx         # Sortable data table
│   │   │
│   │   ├── admin/
│   │   │   ├── user-table.tsx         # User management table
│   │   │   ├── payout-table.tsx       # Payout management table
│   │   │   ├── conversion-table.tsx   # Conversion approval table
│   │   │   └── category-tree.tsx      # Category tree editor
│   │   │
│   │   └── shared/
│   │       ├── loading-state.tsx      # Loading spinner/skeleton
│   │       ├── error-state.tsx        # Error display
│   │       ├── empty-state.tsx        # Empty state placeholder
│   │       ├── confirm-dialog.tsx     # Confirmation modal
│   │       └── posthog-provider.tsx   # PostHog analytics wrapper
│   │
│   ├── lib/
│   │   ├── api.ts                     # API client (fetch wrapper)
│   │   ├── constants.ts               # App constants
│   │   ├── utils.ts                   # Utility functions
│   │   ├── formatters.ts              # Number/date formatters
│   │   └── validators.ts             # Client-side validation
│   │
│   ├── hooks/
│   │   ├── use-api.ts                 # SWR/React Query wrapper
│   │   ├── use-products.ts            # Product data hooks
│   │   ├── use-links.ts              # Affiliate link hooks
│   │   ├── use-analytics.ts           # Analytics data hooks
│   │   ├── use-conversions.ts         # Conversion hooks
│   │   ├── use-payouts.ts            # Payout hooks
│   │   ├── use-debounce.ts           # Debounce hook
│   │   └── use-clipboard.ts          # Clipboard hook
│   │
│   └── types/
│       ├── index.ts                   # Shared types barrel
│       ├── user.ts                    # User types
│       ├── product.ts                 # Product types
│       ├── category.ts                # Category types
│       ├── link.ts                    # Affiliate link types
│       ├── click.ts                   # Click types
│       ├── conversion.ts              # Conversion types
│       ├── payout.ts                  # Payout types
│       ├── analytics.ts              # Analytics types
│       └── api.ts                     # API response wrappers
│
└── shared/
    └── constants.ts                   # Shared constants (if needed)
```

---

## 4. Architecture Decisions

### 4.1 Clerk JWT Verification in Rust

Clerk JWTs are verified on every authenticated request in the Axum middleware layer.

**Implementation approach:**
1. On startup, fetch Clerk's JWKS (JSON Web Key Set) from `https://<clerk-domain>/.well-known/jwks.json`
2. Cache the JWKS with a 1-hour TTL; refresh in background
3. For each request, extract the `Bearer` token from the `Authorization` header
4. Decode the JWT header to get the `kid` (Key ID)
5. Find the matching key in the cached JWKS
6. Verify signature using RS256 algorithm with the `jsonwebtoken` crate
7. Validate claims: `iss` (issuer), `exp` (expiration), `nbf` (not before), `azp` (authorized party)
8. Extract `sub` (Clerk user ID) and look up the internal user record

**Rust dependencies:** `jsonwebtoken`, `reqwest`, `serde_json`, `tokio`

**Middleware signature:**
```rust
pub async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError>
```

The middleware injects the authenticated `User` into request extensions for handlers to access via `Extension<AuthUser>`.

### 4.2 Cookie-Based 30-Day Attribution

**Attribution window:** 30 days from first click.

**Flow:**
1. Visitor clicks tracking link (`/t/:code`)
2. Backend creates or updates a `session` record
3. Backend sets an HTTP-only cookie: `_aff_session=<session_uuid>`
   - `Max-Age`: 2592000 (30 days)
   - `Path`: `/`
   - `HttpOnly`: true
   - `Secure`: true (production)
   - `SameSite`: Lax
4. Visitor is redirected to the product's external URL
5. When a conversion occurs, the merchant's integration reads the session from cookie or passes it via postback
6. Last-click attribution: the most recent affiliate session within the 30-day window gets credit

**Multi-touch handling:** Only the last click within the attribution window is credited (last-click-wins model). Future enhancement: support configurable models (first-click, linear).

### 4.3 Click Deduplication

**Strategy:** IP + User-Agent + Link ID within a time window.

**Rules:**
1. Generate a fingerprint: `SHA256(link_id + ip_address + user_agent)`
2. Check if the same fingerprint exists within the last 30 minutes in Redis/in-memory cache
3. If duplicate found: still record the click but mark `is_unique = false`
4. Unique clicks are counted separately for more accurate analytics
5. Bot detection: filter known bot user-agents from unique counts

**Implementation:**
- Use a time-bucketed in-memory HashMap with 30-minute TTL (or Redis SET with EXPIRE for distributed deployment)
- Clean up expired entries every 5 minutes via background task

### 4.4 Commission Model

**Types:**
- **Percentage**: Commission = order_amount * (commission_rate / 100)
- **Fixed**: Commission = fixed_amount per conversion

**Priority (cascading):**
1. Product-level `commission_rate` (if set)
2. Affiliate-level `commission_rate` (user's negotiated rate)
3. Platform default (10%)

**Commission lifecycle:**
1. **Pending**: Conversion recorded, awaiting review
2. **Approved**: Admin/auto-approved (after configurable hold period, e.g., 14 days)
3. **Rejected**: Fraudulent or refunded
4. **Paid**: Included in a completed payout

**Auto-approval:** Conversions older than 14 days without manual review are auto-approved via a scheduled background job.

### 4.5 Rate Limiting

**Strategy:** Token bucket algorithm per IP and per user.

**Limits:**
| Endpoint Group | Anonymous | Authenticated |
|---------------|-----------|---------------|
| Public reads (`GET /products`) | 60/min | 120/min |
| Tracking (`/t/:code`) | 120/min | N/A |
| Authenticated writes | N/A | 30/min |
| Admin endpoints | N/A | 60/min |
| Conversion postback | N/A | 300/min (API key) |

**Implementation:**
- In-memory token bucket using `governor` crate
- Key: IP for anonymous, user_id for authenticated
- Return `429 Too Many Requests` with `Retry-After` header
- For distributed: Redis-backed sliding window (future)

### 4.6 CORS Configuration

```rust
let cors = CorsLayer::new()
    .allow_origin([
        "https://affiliateplatform.com".parse::<HeaderValue>().unwrap(),
        "https://www.affiliateplatform.com".parse::<HeaderValue>().unwrap(),
        "http://localhost:3000".parse::<HeaderValue>().unwrap(), // dev only
    ])
    .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
    .allow_headers([
        header::AUTHORIZATION,
        header::CONTENT_TYPE,
        header::ACCEPT,
        header::ORIGIN,
    ])
    .allow_credentials(true)
    .max_age(Duration::from_secs(3600));
```

### 4.7 Error Handling Pattern

**Unified error type:**
```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Forbidden")]
    Forbidden,
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Conflict: {0}")]
    Conflict(String),
    #[error("Rate limited")]
    RateLimited,
    #[error("Internal error: {0}")]
    Internal(String),
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".into()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, "Forbidden".into()),
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, msg.clone()),
            AppError::RateLimited => (StatusCode::TOO_MANY_REQUESTS, "Rate limited".into()),
            AppError::Internal(_) | AppError::Database(_) => {
                tracing::error!("Internal error: {:?}", self);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".into())
            }
        };

        Json(json!({ "error": { "code": status.as_u16(), "message": message } })).into_response()
    }
}
```

**Response format (all endpoints):**
```json
// Success
{ "data": { ... }, "pagination": { ... } }

// Error
{ "error": { "code": 400, "message": "Validation error: ..." } }
```

### 4.8 Background Jobs

Implemented via `tokio::spawn` with periodic tasks:
1. **Analytics aggregation**: Run every hour, aggregate raw clicks/conversions into daily analytics table
2. **Session cleanup**: Run daily, remove expired sessions (>30 days)
3. **Auto-approval**: Run every 6 hours, approve pending conversions older than 14 days
4. **JWKS refresh**: Run every hour, refresh Clerk's JWKS cache

---

## 5. Frontend Pages & Routes

| Route | Purpose | Key Components |
|-------|---------|----------------|
| `/` | Landing page / marketing home | Hero, features grid, testimonials, CTA |
| `/about` | About the platform | Team, mission, stats |
| `/pricing` | Commission tiers/plans | Pricing cards, FAQ |
| `/contact` | Contact form | Form, support info |
| `/sign-in` | Clerk sign-in | Clerk `<SignIn>` component |
| `/sign-up` | Clerk sign-up | Clerk `<SignUp>` component |
| `/dashboard` | Affiliate overview | StatsCards, RevenueChart, TopProducts, RecentActivity |
| `/products` | Browse all products | ProductGrid, ProductFilters, ProductSearch, Pagination |
| `/products/[id]` | Product detail + generate link | ProductDetail, LinkGenerator, Reviews |
| `/links` | My affiliate links | LinkCard list, search, filters, bulk actions |
| `/links/[id]` | Link detail with stats | LinkStats, ClicksChart, ConversionChart |
| `/analytics` | Analytics overview | DateRangePicker, MetricCards, Charts, GeoMap |
| `/analytics/clicks` | Click analytics deep-dive | ClicksChart, ByCountry, ByDevice, DataTable |
| `/analytics/conversions` | Conversion analytics | ConversionChart, ByProduct, ByStatus |
| `/conversions` | My conversions list | ConversionTable, StatusFilter, DateFilter |
| `/payouts` | Payout history & requests | PayoutTable, RequestButton, BalanceCard |
| `/settings` | Profile & payout settings | ProfileForm, PayoutForm, NotificationPrefs |
| `/merchant` | Merchant dashboard | MerchantStats, ProductList, ConversionSummary |
| `/merchant/products` | Merchant's products | ProductTable, CreateButton |
| `/merchant/products/new` | Create product | ProductForm |
| `/merchant/products/[id]/edit` | Edit product | ProductForm (prefilled) |
| `/merchant/conversions` | Product conversions | ConversionTable |
| `/admin` | Admin overview | PlatformStats, RecentActivity, Alerts |
| `/admin/users` | User management | UserTable, RoleFilter, SearchBar |
| `/admin/users/[id]` | User detail | UserProfile, ActivityLog, EditForm |
| `/admin/products` | Product moderation | ProductTable, ApprovalActions |
| `/admin/conversions` | Conversion approval | ConversionTable, ApproveRejectButtons |
| `/admin/payouts` | Payout management | PayoutTable, BatchPayoutButton |
| `/admin/categories` | Category management | CategoryTree, CRUD forms |
| `/admin/reviews` | Review moderation | ReviewTable, ApproveRejectButtons |
| `/admin/settings` | Platform settings | ConfigForm, CommissionDefaults |

---

## 6. Environment Variables

### 6.1 Backend (.env)

```bash
# Server
HOST=0.0.0.0
PORT=8080
RUST_LOG=info,tower_http=debug
ENVIRONMENT=development  # development | staging | production

# Database
DATABASE_URL=postgres://user:password@localhost:5432/affiliate_platform
DATABASE_MAX_CONNECTIONS=20
DATABASE_MIN_CONNECTIONS=5

# Clerk Auth
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
CLERK_ISSUER=https://your-app.clerk.accounts.dev

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://affiliateplatform.com
FRONTEND_URL=http://localhost:3000

# Tracking
ATTRIBUTION_WINDOW_DAYS=30
CLICK_DEDUP_WINDOW_SECONDS=1800
COOKIE_DOMAIN=.affiliateplatform.com
COOKIE_SECURE=true

# Commission
DEFAULT_COMMISSION_RATE=10.00
AUTO_APPROVAL_DAYS=14
MIN_PAYOUT_AMOUNT=50.00

# Rate Limiting
RATE_LIMIT_ANONYMOUS=60
RATE_LIMIT_AUTHENTICATED=120
RATE_LIMIT_TRACKING=120

# Geolocation
MAXMIND_DB_PATH=./data/GeoLite2-City.mmdb

# PostHog
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
POSTHOG_HOST=https://app.posthog.com

# Redis (optional, for distributed rate limiting)
REDIS_URL=redis://localhost:6379

# Fly.io
FLY_APP_NAME=affiliate-platform-api
FLY_REGION=iad
```

### 6.2 Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8080/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXT_PUBLIC_APP_NAME=Affiliate Platform
NEXT_PUBLIC_TRACKING_DOMAIN=https://api.affiliateplatform.com

# Vercel
VERCEL_URL=affiliateplatform.vercel.app
```

---

## 7. Key Implementation Notes

### 7.1 Rust Dependencies (Cargo.toml)

```toml
[dependencies]
axum = { version = "0.7", features = ["macros"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "uuid", "chrono", "json"] }
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
jsonwebtoken = "9"
reqwest = { version = "0.12", features = ["json"] }
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "trace", "compression-gzip"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
thiserror = "1"
dotenvy = "0.15"
validator = { version = "0.16", features = ["derive"] }
governor = "0.6"
sha2 = "0.10"
hex = "0.4"
rand = "0.8"
base62 = "2"
maxminddb = "0.24"
csv = "1"
```

### 7.2 Frontend Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@clerk/nextjs": "^5.0.0",
    "posthog-js": "^1.100.0",
    "recharts": "^2.10.0",
    "swr": "^2.2.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.300.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "sonner": "^1.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### 7.3 Deployment Configuration

**Fly.io (backend) - fly.toml:**
```toml
app = "affiliate-platform-api"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[checks]
  [checks.health]
    port = 8080
    type = "http"
    interval = "30s"
    timeout = "5s"
    path = "/health"
```

**Vercel (frontend) - vercel.json:**
```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next"
}
```

### 7.4 Security Checklist

- All passwords/secrets via environment variables only
- HTTPS enforced in production
- SQL injection prevented via parameterized queries (SQLx)
- XSS prevented via React's default escaping + HttpOnly cookies
- CSRF prevented via SameSite cookie + CORS origin checks
- Rate limiting on all public endpoints
- Input validation on all write endpoints (validator crate)
- Clerk webhook signatures verified (Svix)
- API keys hashed before storage
- Sensitive data (IP addresses) hashed after geolocation lookup (GDPR)
- No secrets in client-side code (NEXT_PUBLIC_ prefix convention)
