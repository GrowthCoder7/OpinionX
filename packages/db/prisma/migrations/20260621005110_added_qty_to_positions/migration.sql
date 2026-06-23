/*
  Warnings:

  - Added the required column `qty` to the `Positions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Positions" ADD COLUMN     "qty" INTEGER NOT NULL;
