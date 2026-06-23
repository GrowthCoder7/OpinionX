/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Users_address_key" ON "Users"("address");

-- CreateIndex
CREATE INDEX "Users_address_idx" ON "Users"("address");
