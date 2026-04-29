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
