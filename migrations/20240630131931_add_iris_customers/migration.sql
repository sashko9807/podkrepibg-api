-- CreateTable
CREATE TABLE "iris_customers" (
    "user_hash" UUID NOT NULL,
    "email" VARCHAR NOT NULL,

    CONSTRAINT "iris_customers_pkey" PRIMARY KEY ("user_hash")
);

-- CreateIndex
CREATE INDEX "iris_customers_email_idx" ON "iris_customers"("email");
