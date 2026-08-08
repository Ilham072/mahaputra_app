<?php

namespace App\Services;

class SaleProfitCalculator
{
    public function cashProfit(int $sellingPrice, int $finalCapital): int
    {
        return $sellingPrice - $finalCapital;
    }

    public function creditTotal(
        int $dp,
        int $outstandingDp,
        int $financingDisbursement,
        int $refund,
    ): int {
        return $dp + $outstandingDp + $financingDisbursement + $refund;
    }

    public function creditProfit(int $creditTotal, int $finalCapital): int
    {
        return $creditTotal - $finalCapital;
    }
}
