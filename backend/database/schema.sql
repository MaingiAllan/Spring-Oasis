-- =============================================================================
-- SPRING OASIS PRODUCTION FINANCIAL & SCHOOL MANAGEMENT SUBSYSTEM
-- Multi-Tenant PostgreSQL 16+ Relational Data Model with Row-Level Security (RLS)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANT SCHOOLS
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'SPRING_OASIS'
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. SECURE USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL, -- Argon2id / BCrypt Hash
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'FINANCE_ADMIN', 'TEACHER', 'EMPLOYEE', 'PARENT', 'STUDENT')),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED', 'SUSPENDED')),
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_school_user UNIQUE (school_id, username)
);

-- 3. ACADEMIC YEARS & TERMS
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    year_name VARCHAR(10) NOT NULL, -- e.g., '2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_school_year UNIQUE (school_id, year_name)
);

CREATE TABLE IF NOT EXISTS academic_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    term_name VARCHAR(20) NOT NULL, -- e.g., 'Term 1', 'Term 2', 'Term 3'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_school_year_term UNIQUE (school_id, academic_year_id, term_name)
);

-- 4. STUDENTS & GUARDIANS
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'std-1', 'STD-2026-001'
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. INVOICES & INVOICE ITEMS
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) NOT NULL, -- e.g., 'INV-2026-001'
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    academic_term_id UUID NOT NULL REFERENCES academic_terms(id) ON DELETE RESTRICT,
    total_amount DECIMAL(19,4) NOT NULL CHECK (total_amount >= 0),
    amount_paid DECIMAL(19,4) NOT NULL DEFAULT 0.0000 CHECK (amount_paid >= 0),
    balance DECIMAL(19,4) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'OVERPAID')),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_school_invoice UNIQUE (school_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    fee_type VARCHAR(50) NOT NULL, -- 'TUITION', 'TRANSPORT', 'BOARDING', 'EXCURSION'
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(19,4) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. PAYMENTS & ALLOCATIONS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    payment_reference VARCHAR(100) NOT NULL, -- e.g., 'SO-PAY-2026-9901'
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    amount DECIMAL(19,4) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    provider VARCHAR(50) NOT NULL, -- 'MPESA_EXPRESS', 'MPESA_PAYBILL', 'EQUITY_BANK', 'NCBA'
    provider_transaction_id VARCHAR(100), -- e.g., 'RKT9102948'
    provider_channel VARCHAR(50), -- 'STK_PUSH', 'C2B', 'CARD'
    payer_phone_number VARCHAR(20),
    payer_name VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 
        'CANCELLED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED', 
        'REVERSED', 'REQUIRES_REVIEW'
    )),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_school_payment_ref UNIQUE (school_id, payment_reference),
    CONSTRAINT uq_school_provider_tx UNIQUE (school_id, provider_transaction_id)
);

CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    allocated_amount DECIMAL(19,4) NOT NULL CHECK (allocated_amount > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_payment_invoice UNIQUE (payment_id, invoice_id)
);

-- 7. WEBHOOK EVENTS & IDEMPOTENCY TRACKER
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    event_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    signature VARCHAR(512) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    processing_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSED', 'FAILED', 'DUPLICATE')),
    received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    CONSTRAINT uq_provider_event UNIQUE (provider, event_id)
);

-- 8. TRANSACTIONAL OUTBOX FOR EVENT STREAMING
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(50) NOT NULL, -- 'PAYMENT'
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'PAYMENT_SUCCESS', 'PAYMENT_FAILED'
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

-- 9. RECONCILIATION RUNS & DISCREPANCIES
CREATE TABLE IF NOT EXISTS reconciliation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    run_date DATE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    total_internal_records INT NOT NULL DEFAULT 0,
    total_provider_records INT NOT NULL DEFAULT 0,
    matched_records INT NOT NULL DEFAULT 0,
    discrepancy_records INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reconciliation_discrepancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_run_id UUID REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100),
    provider_transaction_id VARCHAR(100),
    discrepancy_type VARCHAR(50) NOT NULL CHECK (discrepancy_type IN ('UNMATCHED_INTERNAL', 'UNMATCHED_PROVIDER', 'AMOUNT_MISMATCH', 'STATUS_MISMATCH')),
    internal_amount DECIMAL(19,4),
    provider_amount DECIMAL(19,4),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'IGNORED')),
    resolution_notes TEXT,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. REFUNDS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount DECIMAL(19,4) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    initiated_by VARCHAR(100) NOT NULL,
    provider_refund_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SUCCESS', 'REJECTED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ROW LEVEL SECURITY (RLS) POLICIES FOR TENANT ISOLATION
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_school_isolation ON users FOR ALL USING (school_id = current_setting('app.current_school_id', true)::UUID);
CREATE POLICY students_school_isolation ON students FOR ALL USING (school_id = current_setting('app.current_school_id', true)::UUID);
CREATE POLICY invoices_school_isolation ON invoices FOR ALL USING (school_id = current_setting('app.current_school_id', true)::UUID);
CREATE POLICY payments_school_isolation ON payments FOR ALL USING (school_id = current_setting('app.current_school_id', true)::UUID);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id, username);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx ON payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(status, created_at) WHERE status = 'PENDING';
