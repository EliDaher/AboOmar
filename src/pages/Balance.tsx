import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  CreditCard,
  HandCoins,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { DataTable } from "@/components/dashboard/DataTable";
import { apiService, User, Post } from "@/services/api";
import getWifiCustomers, { addWifiExpenses, getWifiBalance } from "@/services/wifi";
import { useNavigate } from "react-router-dom";
import monthlyRevenue from "@/services/reports";
import { Button } from "@/components/ui/button";
import PopupForm from "@/components/ui/custom/PopupForm";
import { Input } from "@/components/ui/input";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";

export default function Balance() {
  const navigate = useNavigate()

  const [totalBalance, setTotalBalance] = useState(0)
  const [customers, setCustomers] = useState([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [monthTotal, setMonthTotal] = useState(0)

  const [isOpen, setIsOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [printOnly, setPrintOnly] = useState(false)
  
  const [paymentDate, setPaymentDate] = useState();
  const [paymentValue, setPaymentValue] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState("");
  
  const [loading, setLoading] = useState(false)

  const getCustomers = async () => {
    const res = await getWifiCustomers();

    if (res?.success) {
      setCustomers(res.customers);

    } else {
      alert(res?.error || "فشل جلب البيانات");
    }
  };
  

  useEffect(() => {
    getCustomers();
  }, []);

  const unpaidValue = useMemo(() => {
    const totalDebt = customers
      .filter(c => c.Balance < 0)
      .reduce((sum, c) => sum + Number(c.Balance), 0);

    return Math.abs(totalDebt);
  }, [customers]);


  // Fetch dashboard data using React Query
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["balance-table"],
    queryFn: getWifiBalance,
  });

  useEffect(()=>{
    let temBalance = 0 
    balance?.WifiBalance?.map(ele => {
      temBalance += Number(ele.amount)
    })
    balance?.WifiPayments?.map(ele => {
      temBalance += Number(ele.Amount)
    })
    console.log(balance)
    setTotalBalance(temBalance)

    // احصل على التاريخ الحالي
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // صفر-based (0=يناير)
    const currentDay = today.getDate();
      
    // فلترة البيانات
    const paymentsThisMonth = balance?.WifiPayments?.filter((payment) => {
      const paymentDate = new Date(payment.Date);
      return (
        paymentDate.getFullYear() === currentYear &&
        paymentDate.getMonth() === currentMonth 
      );
    });
    
    const paymentsThisDay = balance?.WifiPayments?.filter((payment) => {
      const paymentDate = new Date(payment.Date);
      return (
        paymentDate.getFullYear() === currentYear &&
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getDate() === currentDay
      );
    });

    let temMonth = 0
    paymentsThisMonth?.map(ele => {
      temMonth += Number(ele.Amount)
    })
    setMonthTotal(temMonth)
    
    let temDay = 0
    paymentsThisDay?.map(ele => {
      temDay += Number(ele.Amount)
    })
    setTodayTotal(temDay)

  }, [balance])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: apiService.getDashboardStats,
  });


  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ["monthlyRevenue"],
    queryFn: monthlyRevenue,
  });

  const BalanceColumns = [
    { key: "amount", label: "الكمية", sortable: true },
    { key: "details", label: "التفاصيل", sortable: true },
    { key: "timestamp", label: "الوقت", sortable: true },
  ];
  const PaymentsColumns = [
    { key: "Amount", label: "الكمية", sortable: true },
    { key: "Details", label: "التفاصيل", sortable: true },
    { key: "Date", label: "الوقت", sortable: true },
  ];
  const tableRef = useRef();


  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addWifiExpenses,
    onSuccess: () => {
      alert('✅ تمت إضافة الدفعة.');
      queryClient.invalidateQueries({
        queryKey: ['balance-table'],
      });
      setPaymentDate(null);
      setPaymentValue(0);
      setPaymentDetails("");
      setIsOpen(false)
    },
    onError: () => {
      alert('❌ حدث خطأ أثناء الإرسال.');
    }
  });
  
  const handlePrint = useReactToPrint({
    contentRef: tableRef, // استخدام contentRef بشكل صحيح
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }

      body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        padding: 10px;
        color: black;
        direction: rtl;
      }

      .header {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .totalValue {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-top: 10px;
      }

      .cut {
        page-break-before: always;
        margin-top: 20px;
        text-align: center;
        font-style: italic;
      }

      div, span, p {
        break-inside: avoid;
      }

      .no-print {
        display: none !important;
      }
    `
    ,
    onAfterPrint: () => {
      console.log("تمت الطباعة بنجاح!");
      setIsOpen(false); // إغلاق النافذة بعد الطباعة
    },
  });

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'long', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return now.toLocaleDateString('en-GB', options as any);
  };

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (window.confirm('هل تريد طباعة ايصال ؟')) {
      handlePrint();
    }

    const payload = {
      amount: formTitle === "اضافة دفعة الى الصندوق" ? Number(paymentValue) : Number(-paymentValue),
      date: paymentDate ? dayjs(paymentDate).format("YYYY-MM-DD") : '',
      details: paymentDetails,
    };

    mutation.mutate(payload);
  };
  return (
    <DashboardLayout>
      

      <PopupForm isOpen={isOpen} setIsOpen={setIsOpen} title={formTitle} trigger={<></>}>
        <div className="flex flex-row-reverse gap-2">
          {/* تاكيد العمليه */}
            <form onSubmit={handleSubmit} className="space-y-4 w-2/3">
              <Input
                value={paymentValue}
                onChange={(e) => setPaymentValue(Number(e.target.value))}
                type="number"
                placeholder="القيمة بالدولار"
                required
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  className="w-full"
                  label="اختر التاريخ"
                  value={paymentDate}
                  onChange={(newValue) => setPaymentDate(newValue as any)}
                  format="DD/MM/YYYY" // ✅ هنا التنسيق الجديد
                />
              </LocalizationProvider>
              <Input
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                type="text"
                placeholder="تفاصيل (اختياري)"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                disabled={mutation.isPending}
              >
                {mutation.isPending  ? 'جارٍ الإرسال...' : 'حفظ'}
              </button>

            </form>
          
          {/* البيانات المطبوعة */}
          <div ref={tableRef} className="p-4 text-sm" dir="rtl">
            {/* رأس الفاتورة */}
            <div className="header">
              <h1>AboOmar</h1>
              <span>{getCurrentDateTime()}</span>
            </div>
            
            {/* معلومات المشترك 
            <div className="text-right font-bold mb-2">
              <div>اسم المشترك: {customer?.Name || "غير معروف"}</div>
              <div>الرقم: {customer?.Contact}</div>
            </div>*/}
            
            {/* تفاصيل الدفع */}
            <div className="text-right mb-2">
              <div className="font-semibold">التفاصيل:</div>
              <div className="border p-1 rounded">{paymentDetails || "بدون ملاحظات"}</div>
            </div>
            
            {/* المبلغ */}
            <div className="text-right totalValue mt-4">
              <div className="text-lg font-extrabold border-t pt-2">
                {formTitle == "اضافة دفعة" ? 'المبلغ المدفوع' : 'المبلغ المطلوب'}: {paymentValue} دولار
              </div>
            </div>
            
            {/* خط فاصل للطباعة */}
            <div className="cut mt-4 border-t pt-2 text-center text-xs">-- شكراً لثقتكم بخدماتنا --</div>
          </div>

        </div>
      </PopupForm>



      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance</h1>
        </div>

        {/* Stats Cards */}
          {balanceLoading ? 
          <div dir="rtl" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="animate-pulse">
            <StatsCard
              title="الرصيد الحالي"
              value={0}
              description=" . فرق عن الشهر السابق"
              icon={TrendingUp}
              trend={{ value: 0, isPositive: true  }}
              />
          </div>
          </div>
          :
          <div dir="rtl" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <StatsCard
                className="rounded-b-none"
                title="الرصيد الحالي"
                value={totalBalance || 0}
                description=" . فرق عن الشهر السابق"
                icon={TrendingUp}
                trend={{ value: totalBalance - monthTotal || 0, isPositive: (totalBalance - monthTotal) > 0 ? true : false }}
              />
              <div className="">
                <Button 
                  onClick={() => {
                    setFormTitle("اضافة دفعة الى الصندوق");
                    setPrintOnly(false)
                    setIsOpen(true);
                  }}
                  className="w-1/2 rounded-l-none rounded-tr-none"
                >اضف دفعة</Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setFormTitle("دفع من الصندوق");
                    setPrintOnly(false)
                    setIsOpen(true);
                  }}
                  className="w-1/2 rounded-r-none rounded-tl-none"
                >دفع من الصندوق</Button>
              </div>
            </div>
            <StatsCard
              title="ايرادات هذا الشهر"
              value={monthTotal || 0}
              description=" . اليوم"
              icon={CreditCard}
              trend={{ value: todayTotal || 0, isPositive: true }}
              />
            <StatsCard
            onClick={()=>{
              navigate('/users', {state: 'unpaid'})
            }}
            title="الديون"
            value={unpaidValue || 0}
            description=""
            icon={HandCoins}
            trend={{ value: stats?.userGrowth || 0, isPositive: true }}
            />
          </div>
          }

        {/* Charts Section */}
        <div className="grid gap-6 text-center">
          {
            monthly.data ?
            <ChartContainer
            className="mdL:col-span-2"
            title=" الحركة المالية "
            data={
              Object.entries(monthly?.data).map(([month, values] : any) => ({
                name: month,
                "الفواتير": values.invoices,
                "المدفوعات": values.payments,
              }))
            }
            type="area"
            dataKey2="المدفوعات"
            dataKey="الفواتير"
            />
          : <></>}
        </div>

        {/* Data Tables */}

          <div dir="rtl" className="grid gap-6 lg:grid-cols-2">
          <DataTable
            title="الصندوق"
            description=""
            columns={BalanceColumns}
            data={balance?.WifiBalance ? [...balance.WifiBalance].reverse() : []}
            />
          <DataTable
            title="الدفعات"
            description="دفعات المشتركين"
            columns={PaymentsColumns}
            data={balance?.WifiPayments ? [...balance.WifiPayments].reverse() : []}
            />
          </div>
      </div>
    </DashboardLayout>
  );
}
