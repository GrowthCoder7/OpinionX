-- CreateEnum
CREATE TYPE "Type" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('Buy', 'Sell', 'Merge', 'Split');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "usdBalance" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Markets" (
    "mid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "yesOrderBook" JSONB NOT NULL,
    "noOrderBook" JSONB NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "resolution" "Type",
    "resolutionDesc" TEXT,

    CONSTRAINT "Markets_pkey" PRIMARY KEY ("mid")
);

-- CreateTable
CREATE TABLE "Positions" (
    "pid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "type" "Type" NOT NULL,

    CONSTRAINT "Positions_pkey" PRIMARY KEY ("pid")
);

-- CreateTable
CREATE TABLE "OrderHistory" (
    "oid" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,

    CONSTRAINT "OrderHistory_pkey" PRIMARY KEY ("oid")
);

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Positions" ADD CONSTRAINT "Positions_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Markets"("mid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Markets"("mid") ON DELETE RESTRICT ON UPDATE CASCADE;
