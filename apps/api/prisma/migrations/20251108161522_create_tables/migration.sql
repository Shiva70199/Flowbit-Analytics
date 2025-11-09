
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "taxId" TEXT,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" BIGINT,
    "file_type" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "invoice_date" DATE NOT NULL,
    "delivery_date" DATE,
    "due_date" DATE,
    "document_type" TEXT,
    "currency_symbol" TEXT DEFAULT '€',
    "sub_total" DOUBLE PRECISION NOT NULL,
    "total_tax" DOUBLE PRECISION NOT NULL,
    "invoice_total" DOUBLE PRECISION NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "customer_id" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "sachkonto" TEXT,
    "bu_schluessel" TEXT,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "vendors_name_key" ON "vendors"("name");


CREATE UNIQUE INDEX "customers_name_key" ON "customers"("name");


CREATE UNIQUE INDEX "invoices_document_id_key" ON "invoices"("document_id");


ALTER TABLE "invoices" ADD CONSTRAINT "invoices_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "line_items" ADD CONSTRAINT "line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
