import { create } from "zustand";
import * as XLSX from "xlsx";

export const useDownloadStore = create(() => ({
  downloadSelected: (containerRef, baseFilename = "data") => {
    if (!containerRef?.current) {
      alert("No container provided!");
      return;
    }

    const container = containerRef.current;
    const tables = container.querySelectorAll("table");

    if (!tables.length) {
      alert("No table found inside container!");
      return;
    }

    tables.forEach((table, index) => {
      const data = [];
      const rows = table.querySelectorAll("tr");

      rows.forEach((tr) => {
        if (tr.closest(".no-download")) return;

        const rowData = [];
        tr.querySelectorAll("th, td").forEach((cell) => {
          if (cell.closest(".no-download")) return;
          const text = cell.innerText?.trim() ?? "";
          rowData.push(text);
        });

        if (rowData.length) data.push(rowData);
      });

      if (data.length) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, `Sheet1`);

        const filename = `${baseFilename}_${index + 1}.xlsx`;
        XLSX.writeFile(wb, filename);
      }
    });
  },
}));
