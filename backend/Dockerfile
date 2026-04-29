FROM rust:1.78-bookworm AS builder
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock* ./
COPY src ./src
COPY migrations ./migrations

RUN cargo build --release

FROM debian:bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 10001 appuser

COPY --from=builder /app/target/release/affiliate-platform-backend /usr/local/bin/affiliate-platform-backend
COPY --from=builder /app/migrations /app/migrations

ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080

USER appuser
ENTRYPOINT ["/usr/local/bin/affiliate-platform-backend"]