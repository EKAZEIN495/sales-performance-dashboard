export const CATEGORIES = ["DEVICE", "ACC_IOT", "REPAIR_CONTRACT", "CARRIER", "CE"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  DEVICE: "Device",
  ACC_IOT: "ACC + IoT",
  REPAIR_CONTRACT: "Repair Contract",
  CARRIER: "Carrier",
  CE: "CE",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  DEVICE: "#ef3f23",
  ACC_IOT: "#ff7a21",
  REPAIR_CONTRACT: "#fbbf24",
  CARRIER: "#fb7185",
  CE: "#8b5cf6",
};
