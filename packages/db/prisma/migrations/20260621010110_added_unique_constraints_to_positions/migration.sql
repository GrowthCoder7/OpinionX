/*
  Warnings:

  - A unique constraint covering the columns `[userId,marketId,type]` on the table `Positions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Positions_userId_marketId_type_key" ON "Positions"("userId", "marketId", "type");
