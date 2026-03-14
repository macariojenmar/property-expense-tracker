-- AlterTable
ALTER TABLE "RecurringExpense" ADD COLUMN     "pendingToId" TEXT;

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_pendingToId_fkey" FOREIGN KEY ("pendingToId") REFERENCES "PendingTo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
