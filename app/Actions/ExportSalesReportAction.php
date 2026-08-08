<?php

namespace App\Actions;

use RuntimeException;
use ZipArchive;

class ExportSalesReportAction
{
    /**
     * @param  array{date_from: string, date_to: string, search: string, area_id: string, employee_id: string, payment_type: string, capital_type: string}  $filters
     * @param  array{sales_count: int, sales_value: int, profit_total: int, final_capital_total: int, operational_total: int, profit_minus_operational: int}  $summary
     * @param  list<array<string, mixed>>  $rows
     */
    public function execute(array $filters, array $summary, array $rows): string
    {
        $directory = storage_path('app/exports');

        if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
            throw new RuntimeException("Tidak dapat membuat direktori export: {$directory}");
        }

        $path = $directory.'/laporan-penjualan-'.now()->format('YmdHis').'-'.bin2hex(random_bytes(4)).'.xlsx';
        $zip = new ZipArchive;

        if ($zip->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Tidak dapat membuat file XLSX.');
        }

        $zip->addFromString('[Content_Types].xml', $this->contentTypes());
        $zip->addFromString('_rels/.rels', $this->rootRelationships());
        $zip->addFromString('xl/workbook.xml', $this->workbook());
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->workbookRelationships());
        $zip->addFromString('xl/styles.xml', $this->styles());
        $zip->addFromString('docProps/core.xml', $this->coreProperties());
        $zip->addFromString('docProps/app.xml', $this->appProperties());
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->worksheet($filters, $summary, $rows));
        $zip->close();

        return $path;
    }

    /**
     * @param  array{date_from: string, date_to: string, search: string, area_id: string, employee_id: string, payment_type: string, capital_type: string}  $filters
     * @param  array{sales_count: int, sales_value: int, profit_total: int, final_capital_total: int, operational_total: int, profit_minus_operational: int}  $summary
     * @param  list<array<string, mixed>>  $rows
     */
    private function worksheet(array $filters, array $summary, array $rows): string
    {
        $sheetRows = [
            $this->row(1, [['Laporan Penjualan Mahaputra Group', 's', 1]]),
            $this->row(2, [['Periode', 's', 2], [$filters['date_from'].' sampai '.$filters['date_to'], 's']]),
            $this->row(3, [['Filter Search', 's', 2], [$filters['search'] ?: '-', 's']]),
            $this->row(4, [['Total Transaksi', 's', 2], [$summary['sales_count'], 'n']]),
            $this->row(5, [['Nilai Penjualan', 's', 2], [$summary['sales_value'], 'n', 3]]),
            $this->row(6, [['Laba Kendaraan', 's', 2], [$summary['profit_total'], 'n', 3]]),
            $this->row(7, [['Operasional', 's', 2], [$summary['operational_total'], 'n', 3]]),
            $this->row(8, [['Selisih Laba - Operasional', 's', 2], [$summary['profit_minus_operational'], 'n', 3]]),
        ];

        $headers = [
            'No',
            'Tanggal Jual',
            'Area',
            'PIC',
            'Kendaraan',
            'No Polisi',
            'Tahun',
            'UMUM/KHUSUS',
            'Tanggal Pembelian',
            'Status Bayar',
            'Harga Jual',
            'DP',
            'DP Terutang',
            'Modal Awal',
            'Total Biaya Kendaraan',
            'Modal Akhir',
            'Laba Kendaraan',
        ];
        $sheetRows[] = $this->row(10, array_map(fn (string $header): array => [$header, 's', 2], $headers));

        foreach ($rows as $index => $reportRow) {
            $sheetRows[] = $this->row($index + 11, [
                [$index + 1, 'n'],
                [$reportRow['sale_date'], 's'],
                [$reportRow['area'], 's'],
                [$reportRow['employee'], 's'],
                [$reportRow['vehicle'], 's'],
                [$reportRow['plate_number'], 's'],
                [$reportRow['year'], 'n'],
                [$reportRow['capital_type'], 's'],
                [$reportRow['purchase_date'], 's'],
                [$reportRow['payment_type'], 's'],
                [$reportRow['selling_price'], 'n', 3],
                [$reportRow['dp'], 'n', 3],
                [$reportRow['outstanding_dp'], 'n', 3],
                [$reportRow['initial_capital_snapshot'], 'n', 3],
                [$reportRow['vehicle_cost_snapshot'], 'n', 3],
                [$reportRow['final_capital_snapshot'], 'n', 3],
                [$reportRow['profit_snapshot'], 'n', 3],
            ]);
        }

        $lastRow = max(count($rows) + 10, 10);

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheetViews><sheetView workbookViewId="0"><pane ySplit="10" topLeftCell="A11" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
            .'<cols>'
            .'<col min="1" max="1" width="6" customWidth="1"/>'
            .'<col min="2" max="4" width="16" customWidth="1"/>'
            .'<col min="5" max="6" width="22" customWidth="1"/>'
            .'<col min="7" max="10" width="16" customWidth="1"/>'
            .'<col min="11" max="17" width="18" customWidth="1"/>'
            .'</cols>'
            .'<sheetData>'.implode('', $sheetRows).'</sheetData>'
            .'<autoFilter ref="A10:Q'.$lastRow.'"/>'
            .'</worksheet>';
    }

    /**
     * @param  list<array{0: mixed, 1: 's'|'n', 2?: int}>  $cells
     */
    private function row(int $rowNumber, array $cells): string
    {
        $xml = '<row r="'.$rowNumber.'">';

        foreach ($cells as $index => $cell) {
            [$value, $type] = $cell;
            $style = $cell[2] ?? 0;
            $reference = $this->columnName($index + 1).$rowNumber;

            if ($type === 'n') {
                $xml .= '<c r="'.$reference.'" s="'.$style.'"><v>'.(int) $value.'</v></c>';
            } else {
                $xml .= '<c r="'.$reference.'" s="'.$style.'" t="inlineStr"><is><t>'.$this->escape((string) $value).'</t></is></c>';
            }
        }

        return $xml.'</row>';
    }

    private function columnName(int $number): string
    {
        $name = '';

        while ($number > 0) {
            $number--;
            $name = chr(65 + ($number % 26)).$name;
            $number = intdiv($number, 26);
        }

        return $name;
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }

    private function contentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
            .'<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
            .'</Types>';
    }

    private function rootRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            .'<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
            .'</Relationships>';
    }

    private function workbook(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="Rekap Penjualan" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';
    }

    private function workbookRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    private function styles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
            .'<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAB308"/><bgColor indexed="64"/></patternFill></fill></fills>'
            .'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="4">'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
            .'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'
            .'<xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            .'</cellXfs>'
            .'<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            .'</styleSheet>';
    }

    private function coreProperties(): string
    {
        $timestamp = now()->toIso8601String();

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            .'<dc:title>Laporan Penjualan</dc:title><dc:creator>Mahaputra Apps</dc:creator>'
            .'<dcterms:created xsi:type="dcterms:W3CDTF">'.$timestamp.'</dcterms:created>'
            .'<dcterms:modified xsi:type="dcterms:W3CDTF">'.$timestamp.'</dcterms:modified>'
            .'</cp:coreProperties>';
    }

    private function appProperties(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
            .'<Application>Mahaputra Apps</Application>'
            .'</Properties>';
    }
}
