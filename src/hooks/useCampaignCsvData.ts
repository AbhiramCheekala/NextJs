import { useState } from 'react';
import * as XLSX from 'xlsx';

export const useCampaignCsvData = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  const handleFileUpload = (file: File, requiredHeaders?: string[]) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (json.length > 1) {
            const headers = json[0] as string[];

            if (requiredHeaders) {
              const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
              if (missingHeaders.length > 0) {
                setCsvError(`The following required headers are missing: ${missingHeaders.join(', ')}`);
                setCsvData([]);
                setCsvHeaders([]);
                return;
              }
            }

            setCsvHeaders(headers);
            const rows = json.slice(1).map((row: any) => {
              const rowData: any = {};
              headers.forEach((header, index) => {
                rowData[header] = row[index];
              });
              return rowData;
            });
            setCsvData(rows);
            setCsvError(null);
          } else {
            setCsvError('CSV file is empty or has only headers.');
            setCsvData([]);
            setCsvHeaders([]);
          }
        } catch (error) {
          setCsvError('Error parsing CSV file.');
          setCsvData([]);
          setCsvHeaders([]);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  return { csvData, csvHeaders, csvError, handleFileUpload };
};
