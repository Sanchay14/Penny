-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "public"."transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_userId_date_idx" ON "public"."transactions"("userId", "date");

-- CreateIndex
CREATE INDEX "transactions_accountId_date_idx" ON "public"."transactions"("accountId", "date");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "public"."transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_category_idx" ON "public"."transactions"("category");

-- CreateIndex
CREATE INDEX "users_clerkUserId_idx" ON "public"."users"("clerkUserId");
