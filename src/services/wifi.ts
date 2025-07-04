import apiClient from "@/lib/axios";

export default async function getWifiCustomers() {

    try {
      const response = await apiClient.get("/api/wifi/getCustomers");

      return response.data
      
    } catch (err) {
      console.error("خطأ في تسجيل الدخول:", err);
   
    }

}

export async function getCustomerById(id: string) {
  try {
    const response = await apiClient.get(`/api/wifi/getCustomerById/${id}`);
    const data = await response.data
    return data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { success: false, error };
  }
}

export async function getWifiBalance() {
  try {
    const response = await apiClient.get(`/api/wifi/getWifiBalance`);
    const data = await response.data
    return data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { success: false, error };
  }
}

export async function getTransactionsForCustomer(id: string) {
  try {
    const response = await apiClient.get(`/api/wifi/getTransactionsForCustomer/${id}`);
    return response.data;  // يفترض أن يعيد { success: true, data: [...] }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error };
  }
}


export async function addPayment(data: {
  amount: number;
  date: string; // "2025-01-18"
  details: string;
  subscriberID: string;
  total: number;
  dealer?: string;
}) {
  try {
    console.log(data)
    const response = await apiClient.post("/api/wifi/addPayment/", data);
    return response.data; // { message, paymentID, newTotal }
  } catch (error) {
    console.error("Error adding payment:", error);
    return { success: false, error };
  }
}

export async function addInvoice(data: {
  amount: number;
  date: string; // "2025-01-18"
  details: string;
  subscriberID: string;
}) {
  try {
    const response = await apiClient.post("/api/wifi/addInvoice", data);
    return response.data; // { message, invoiceID, newBalance }
  } catch (error) {
    console.error("Error adding invoice:", error);
    return { success: false, error };
  }
}



export async function updateCustomer(id: string, newData: any) {
  try {
    const response = await apiClient.put(`/api/wifi/updateCustomer/${id}`, {...newData, Balance: Number(newData.Balance), MonthlyFee: Number(newData.MonthlyFee)});
    return response.data;  // يفترض أن يعيد { success: true, data: [...] }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error };
  }
}


export async function addCustomer(formData: any) {
  try {
    const response = await apiClient.post("/api/wifi/addCustomer", formData);
    console.log('test')
    return {
      success: true,
      data: response.data,
    };
  } catch (error: unknown) {
    const axiosError = error as any;

    const message =
      axiosError?.response?.data?.error ||
      axiosError?.message ||
      "حدث خطأ غير متوقع أثناء الاتصال بالخادم.";

    console.error("❌ addCustomer error:", message);

    return {
      success: false,
      message,
    };
  }
}

export async function addWifiExpenses(data: {
  amount: number;
  date: string;
  details: string;
}) {
  try {
    const response = await apiClient.post("/api/wifi/addWifiExpenses", data);
    return response.data; 
  } catch (error) {
    console.error("Error adding invoice:", error);
    return { success: false, error };
  }
}