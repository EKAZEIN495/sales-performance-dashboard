import type {
  DashboardData,
  MetricRow,
  SalesPerformance,
} from "./dashboard-types";
import { CATEGORY_LABELS, type Category } from "./constants";

type Group = {
  key: Category | "TOTAL";
  label: string;
  dark: string;
  light: string;
};

const GROUPS: Group[] = [
  { key: "DEVICE", label: "DEVICE", dark: "FF0891B2", light: "FFCFFAFE" },
  { key: "ACC_IOT", label: "ACC + IOT", dark: "FF16A34A", light: "FFDCFCE7" },
  {
    key: "REPAIR_CONTRACT",
    label: "REPAIR CONTRACT",
    dark: "FFDB2777",
    light: "FFFCE7F3",
  },
  { key: "CARRIER", label: "CARRIER", dark: "FFEA580C", light: "FFFFEDD5" },
  { key: "CE", label: "CE", dark: "FFDC2626", light: "FFFEE2E2" },
  { key: "TOTAL", label: "TOTAL ALL", dark: "FF7C3AED", light: "FFEDE9FE" },
];

function metric(person: SalesPerformance, key: Category | "TOTAL") {
  return key === "TOTAL"
    ? person.total
    : person.rows.find((row) => row.category === key)!;
}

function totalMetric(data: DashboardData, key: Category | "TOTAL") {
  return key === "TOTAL"
    ? data.grandTotal
    : data.categories.find((row) => row.category === key)!;
}

function excelColumn(index: number) {
  let result = "";
  while (index > 0) {
    const remainder = (index - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    index = Math.floor((index - 1) / 26);
  }
  return result;
}

async function chartSvgToPng(svg: SVGSVGElement, title: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const bounds = svg.getBoundingClientRect();
  const sourceWidth = Math.max(Math.round(bounds.width), 600);
  const sourceHeight = Math.max(Math.round(bounds.height), 280);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(sourceWidth));
  clone.setAttribute("height", String(sourceHeight));

  const serialized = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(
    new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error(`Grafik ${title} gagal dirender.`));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 430;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Browser tidak mendukung canvas untuk export grafik.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#7f1d1d";
    context.font = "bold 24px Arial";
    context.textAlign = "center";
    context.fillText(title.toUpperCase(), canvas.width / 2, 34);
    context.strokeStyle = "#e7e5e4";
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    context.drawImage(image, 25, 55, 910, 350);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

async function captureDashboardCharts() {
  const containers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-excel-chart]"),
  );
  const charts = await Promise.all(
    containers.map(async (container) => {
      const svg = container.querySelector<SVGSVGElement>(
        "svg.recharts-surface",
      );
      if (!svg) return null;
      const title = container.dataset.excelTitle || "Grafik Dashboard";
      return {
        key: container.dataset.excelChart || title,
        title,
        png: await chartSvgToPng(svg, title),
      };
    }),
  );
  return charts.filter(
    (chart): chart is NonNullable<typeof chart> => chart !== null,
  );
}

/** Membuat workbook .xlsx dari snapshot dashboard yang sedang terlihat. */
export async function exportDashboardToExcel(data: DashboardData) {
  const ExcelJS = (await import("exceljs")).default;
  const chartImages = await captureDashboardCharts();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Erafone & More Sales Dashboard";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Sales Performance", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 5 }],
  });

  sheet.mergeCells("A1:AC1");
  sheet.getCell("A1").value = "SALES PERFORMANCE DASHBOARD";
  sheet.getCell("A1").font = {
    bold: true,
    size: 20,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFB91C1C" },
  };
  sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells("A2:AC2");
  sheet.getCell("A2").value =
    `${data.sales[0]?.store || "ERAFONE & MORE"} — ${data.period.label.toUpperCase()} — SNAPSHOT HARI KE-${data.period.elapsedDays}`;
  sheet.getCell("A2").font = { bold: true, color: { argb: "FF7F1D1D" } };
  sheet.getCell("A2").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFEDD5" },
  };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  sheet.mergeCells("A4:A5");
  sheet.getCell("A4").value = "SALES";
  sheet.getCell("A4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1C1917" },
  };
  sheet.getCell("A4").font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getCell("A4").alignment = { horizontal: "center", vertical: "middle" };

  let column = 2;
  for (const group of GROUPS) {
    const start = column;
    const end = column + 3;
    sheet.mergeCells(4, start, 4, end);
    const header = sheet.getCell(4, start);
    header.value = group.label;
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: group.dark },
    };
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.alignment = { horizontal: "center" };
    ["TARGET", "MTD", "EXPECT", "%"].forEach((label, offset) => {
      const cell = sheet.getCell(5, start + offset);
      cell.value = label;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: group.light },
      };
      cell.font = { bold: true, color: { argb: "FF292524" } };
      cell.alignment = { horizontal: "center" };
    });
    column = end + 1;
  }

  const extras = [
    { label: "ACTUAL BULAN LALU", dark: "FF2563EB", light: "FFDBEAFE" },
    { label: "GROWTH", dark: "FF059669", light: "FFD1FAE5" },
    { label: "GAP", dark: "FFD97706", light: "FFFEF3C7" },
    { label: "TARGET BY DAY", dark: "FF0369A1", light: "FFE0F2FE" },
  ];
  extras.forEach((extra, offset) => {
    const col = 26 + offset;
    sheet.mergeCells(4, col, 5, col);
    const cell = sheet.getCell(4, col);
    cell.value = extra.label;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: extra.dark },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });

  const rows: Array<{
    name: string;
    get: (key: Category | "TOTAL") => MetricRow;
    previous: number | null;
    growth: number | null;
  }> = [
    ...data.sales.map((person) => ({
      name: person.name,
      get: (key: Category | "TOTAL") => metric(person, key),
      previous: person.previousActual,
      growth: person.growth,
    })),
    {
      name: "TOTAL",
      get: (key: Category | "TOTAL") => totalMetric(data, key),
      previous: data.previousActual,
      growth: data.growth,
    },
  ];

  rows.forEach((item, rowOffset) => {
    const rowNumber = 6 + rowOffset;
    const isTotal = item.name === "TOTAL";
    sheet.getCell(rowNumber, 1).value = item.name;
    let currentColumn = 2;
    GROUPS.forEach((group) => {
      const value = item.get(group.key);
      const values = [
        value.target,
        value.mtd,
        value.expect,
        value.achievement === null ? null : value.achievement / 100,
      ];
      values.forEach((cellValue, index) => {
        const cell = sheet.getCell(rowNumber, currentColumn + index);
        cell.value = cellValue;
        cell.numFmt = index === 3 ? "0%" : "#,##0";
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isTotal ? "FFFFE699" : group.light },
        };
        cell.alignment = { horizontal: "right" };
      });
      currentColumn += 4;
    });
    const total = item.get("TOTAL");
    const extraValues = [
      item.previous,
      item.growth === null ? null : item.growth / 100,
      total.gap,
      total.targetByDay,
    ];
    extraValues.forEach((value, index) => {
      const cell = sheet.getCell(rowNumber, 26 + index);
      cell.value = value;
      cell.numFmt = index === 1 ? "+0%;-0%;0%" : "#,##0";
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isTotal ? "FFFFE699" : extras[index].light },
      };
      cell.alignment = { horizontal: "right" };
    });
    if (isTotal) sheet.getRow(rowNumber).font = { bold: true };
  });

  const lastRow = 5 + rows.length;
  for (let row = 4; row <= lastRow; row += 1) {
    for (let col = 1; col <= 29; col += 1) {
      sheet.getCell(row, col).border = {
        top: { style: "thin", color: { argb: "FFA8A29E" } },
        bottom: { style: "thin", color: { argb: "FFA8A29E" } },
        left: { style: "thin", color: { argb: "FFA8A29E" } },
        right: { style: "thin", color: { argb: "FFA8A29E" } },
      };
    }
  }
  sheet.getColumn(1).width = 31;
  for (let col = 2; col <= 29; col += 1)
    sheet.getColumn(col).width = col % 4 === 1 ? 10 : 16;
  sheet.autoFilter = { from: "A5", to: `AC${lastRow}` };

  const overviewRow = lastRow + 3;
  sheet.mergeCells(overviewRow, 1, overviewRow, 29);
  const overviewTitle = sheet.getCell(overviewRow, 1);
  overviewTitle.value = "TOTAL ALL OVERVIEW";
  overviewTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFB91C1C" },
  };
  overviewTitle.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  overviewTitle.alignment = { horizontal: "center" };

  const overviewCards = [
    {
      label: "TOTAL TARGET",
      value: data.grandTotal.target,
      from: 1,
      to: 5,
      color: "FFDBEAFE",
      font: "FF1D4ED8",
      format: "#,##0",
    },
    {
      label: "TOTAL MTD",
      value: data.grandTotal.mtd,
      from: 6,
      to: 10,
      color: "FFFFEDD5",
      font: "FFC2410C",
      format: "#,##0",
    },
    {
      label: "TOTAL EXPECT",
      value: data.grandTotal.expect,
      from: 11,
      to: 15,
      color: "FFEDE9FE",
      font: "FF6D28D9",
      format: "#,##0",
    },
    {
      label: "GROWTH VS BULAN LALU",
      value: data.growth === null ? null : data.growth / 100,
      from: 16,
      to: 20,
      color: "FFD1FAE5",
      font: "FF047857",
      format: "+0%;-0%;0%",
    },
    {
      label: "TOTAL GAP",
      value: data.grandTotal.gap,
      from: 21,
      to: 25,
      color: "FFFEF3C7",
      font: "FFB45309",
      format: "#,##0",
    },
    {
      label: "TARGET BY DAY",
      value: data.grandTotal.targetByDay,
      from: 26,
      to: 29,
      color: "FFE0F2FE",
      font: "FF0369A1",
      format: "#,##0",
    },
  ];
  overviewCards.forEach((card) => {
    sheet.mergeCells(overviewRow + 1, card.from, overviewRow + 1, card.to);
    sheet.mergeCells(overviewRow + 2, card.from, overviewRow + 3, card.to);
    const label = sheet.getCell(overviewRow + 1, card.from);
    const value = sheet.getCell(overviewRow + 2, card.from);
    label.value = card.label;
    value.value = card.value;
    value.numFmt = card.format;
    [label, value].forEach((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: card.color },
      };
      cell.font = {
        bold: true,
        color: { argb: card.font },
        size: cell === value ? 18 : 10,
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD6D3D1" } },
        bottom: { style: "thin", color: { argb: "FFD6D3D1" } },
        left: { style: "thin", color: { argb: "FFD6D3D1" } },
        right: { style: "thin", color: { argb: "FFD6D3D1" } },
      };
    });
  });
  sheet.getRow(overviewRow + 1).height = 24;
  sheet.getRow(overviewRow + 2).height = 28;
  sheet.getRow(overviewRow + 3).height = 28;

  const chartStartRow = overviewRow + 6;
  const chartRanges = [
    `A${chartStartRow}:I${chartStartRow + 15}`,
    `K${chartStartRow}:S${chartStartRow + 15}`,
    `U${chartStartRow}:AC${chartStartRow + 15}`,
  ];
  chartImages.slice(0, 3).forEach((chart, index) => {
    const imageId = workbook.addImage({ base64: chart.png, extension: "png" });
    sheet.addImage(imageId, chartRanges[index]);
  });
  if (chartImages.length === 0) {
    sheet.mergeCells(chartStartRow, 1, chartStartRow + 2, 29);
    const warning = sheet.getCell(chartStartRow, 1);
    warning.value =
      "Grafik belum dapat ditangkap. Pastikan ketiga grafik sudah terlihat di dashboard sebelum menekan Export Excel.";
    warning.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    warning.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFEF3C7" },
    };
  }

  const summary = workbook.addWorksheet("Ringkasan Kategori", {
    views: [{ state: "frozen", ySplit: 3 }],
  });
  summary.mergeCells("A1:H1");
  summary.getCell("A1").value =
    `RINGKASAN KATEGORI — ${data.period.label.toUpperCase()}`;
  summary.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFB91C1C" },
  };
  summary.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: "FFFFFFFF" },
  };
  summary.getCell("A1").alignment = { horizontal: "center" };
  summary.addRow([]);
  summary.addRow([
    "KATEGORI",
    "TARGET",
    "MTD",
    "EXPECT",
    "ACHIEVEMENT",
    "GAP",
    "TARGET/HARI",
    "KONTRIBUSI MTD",
  ]);
  [...data.categories, data.grandTotal].forEach((row) => {
    const isTotal = row.category === "TOTAL";
    summary.addRow([
      row.label,
      row.target,
      row.mtd,
      row.expect,
      row.achievement === null ? null : row.achievement / 100,
      row.gap,
      row.targetByDay,
      data.grandTotal.mtd === 0 ? 0 : row.mtd / data.grandTotal.mtd,
    ]);
    const excelRow = summary.lastRow!;
    const group = GROUPS.find((item) => item.key === row.category) || GROUPS[5];
    excelRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isTotal ? "FFFFE699" : group.light },
    };
    excelRow.font = { bold: isTotal };
  });
  summary.getRow(3).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF292524" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", wrapText: true };
  });
  summary.eachRow((row, rowNumber) => {
    if (rowNumber >= 4) {
      [2, 3, 4, 6, 7].forEach((col) => (row.getCell(col).numFmt = "#,##0"));
      [5, 8].forEach((col) => (row.getCell(col).numFmt = "0.0%"));
    }
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD6D3D1" } },
        bottom: { style: "thin", color: { argb: "FFD6D3D1" } },
        left: { style: "thin", color: { argb: "FFD6D3D1" } },
        right: { style: "thin", color: { argb: "FFD6D3D1" } },
      };
    });
  });
  summary.getColumn(1).width = 24;
  for (let col = 2; col <= 8; col += 1) summary.getColumn(col).width = 18;

  const guide = workbook.addWorksheet("Panduan & Rumus");
  const guideRows = [
    ["PANDUAN INPUT DAN RUMUS", "KETERANGAN / RUMUS EXCEL"],
    [
      "Input Sales",
      "Daftar nama sales dan store. Menonaktifkan sales menyimpan histori tetapi mengeluarkannya dari dashboard.",
    ],
    [
      "Input Target",
      "Target omzet satu sales untuk satu kategori pada bulan dan tahun tertentu. Isi sekali per kombinasi sales + kategori + periode.",
    ],
    [
      "Input Daily Entry",
      "Snapshot MTD akumulatif pada tanggal input. Bukan transaksi pada hari itu. Dashboard mengambil tanggal terbaru.",
    ],
    [
      "Tanggal snapshot",
      "Letakkan tanggal snapshot di $B$1, contoh 25/08/2026.",
    ],
    ["Jumlah hari bulan", "=DAY(EOMONTH($B$1,0))"],
    ["Hari berjalan", "=DAY($B$1)"],
    ["Expect", "=ROUND(D2*(DAY(EOMONTH($B$1,0))/DAY($B$1)),0)"],
    ["Achievement %", "=IFERROR(E2/C2,0) lalu format sebagai Percentage"],
    ["Gap", "=C2-D2"],
    [
      "Target by Day",
      "=IF(DAY(EOMONTH($B$1,0))-DAY($B$1)=0,0,F2/(DAY(EOMONTH($B$1,0))-DAY($B$1)))",
    ],
    [
      "Kontribusi kategori",
      "=IFERROR(D2/SUM($D$2:$D$6),0) lalu format sebagai Percentage",
    ],
    [
      "Growth",
      "=IFERROR((E2-H2)/H2,0) lalu format sebagai Percentage; H2 adalah actual final bulan lalu",
    ],
    [
      "MTD dari transaksi mentah",
      "Jika Excel berisi transaksi harian: =SUMIFS(KolomNilai,KolomSales,NamaSales,KolomKategori,Kategori,KolomTanggal,\<=\&$B$1)",
    ],
  ];
  guide.addRows(guideRows);
  guide.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  guide.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFB91C1C" },
  };
  guide.getColumn(1).width = 28;
  guide.getColumn(2).width = 105;
  guide.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
    row.height = 34;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sales-performance-${data.period.year}-${String(data.period.month).padStart(2, "0")}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
