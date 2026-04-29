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

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
