import apiClient from "@/lib/axios";

export default async function getTodyBalance(date?: string) {
  try {
    const response = await apiClient.get("/api/balance/getTotalDayBalance", {
      params: date ? { date } : {},
    });

    return response.data;
  } catch (err) {
    console.error("خطأ في جلب الرصيد اليومي:", err);
  }
}

export async function getBalanceByDate(date?: string) {
  try {
    const response = await apiClient.get("/api/balance/getTotalBalance", {
      params: date ? { date } : {},
    });

    return response.data;
  } catch (err) {
    console.error("خطأ في جلب الرصيد اليومي:", err);
  }
}
