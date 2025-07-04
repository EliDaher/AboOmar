import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Printer, RefreshCwIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { addInvoice, addPayment, getCustomerById, getTransactionsForCustomer,  } from "../services/wifi";
import DetailsInputs from "@/components/customers/DetailsInputs";
import PopupForm from "@/components/ui/custom/PopupForm";
import { useReactToPrint } from "react-to-print";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DataTable } from "@/components/dashboard/DataTable";


export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentItems = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [isOpen, setIsOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [printOnly, setPrintOnly] = useState(false)

  const [paymentDate, setPaymentDate] = useState();
  const [paymentValue, setPaymentValue] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState("");
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoadingCustomer(true);
      const userRes = await getCustomerById(id);
      if (userRes.success) setCustomer(userRes.data);
      setLoadingCustomer(false);
    };
    fetchCustomer();
  }, [id]);

  useEffect(() => {
    reloadTransactions();
  }, [id]);

  const reloadTransactions = async () => {
    setLoadingTransactions(true);
    const transRes = await getTransactionsForCustomer(id);
    if (transRes.success) setTransactions(transRes.data);
    setLoadingTransactions(false);
  };

  const handleSubmit = async (e) => {
    setLoading(true)
    if(window.confirm('هل تريد طباعة ايصال ؟')){ handlePrint() }
    e.preventDefault();
    const payload = {
      amount: paymentValue,
      date: paymentDate ? dayjs(paymentDate).format("YYYY-MM-DD") : '',
      details: paymentDetails,
      subscriberID: id,
      total: Number(customer.Balance) || 0,
      //dealer: "dealer01", // (اختياري)
    };

    if(formTitle == 'اضافة فاتورة'){
      
      const res = await addInvoice(payload);
      if (res.message && res.message.includes('success')) {
        alert("تمت الإضافة بنجاح");
        setIsOpen(false);
        reloadTransactions();
        setPaymentDate(null);
        setPaymentValue(0);
        setPaymentDetails("");
      } else {
        alert("حدث خطأ أثناء الإرسال");
      }

    }else{
      
      const res = await addPayment(payload);
      if (res.message && res.message.includes('success')) {
        alert("تمت الإضافة بنجاح");
        setIsOpen(false);
        reloadTransactions();
        setPaymentDate(null);
        setPaymentValue(0);
        setPaymentDetails("");
      } else {
        alert("حدث خطأ أثناء الإرسال");
      }
      
    }
    setLoading(false)
  };


  const tableRef = useRef();

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


  useEffect(()=>{

    if(isOpen && printOnly){
      handlePrint()
    }

  }, [printOnly, isOpen])


  if (loadingCustomer || !customer) {
    return (
      <DashboardLayout>
        <Skeleton className="h-64 w-full" />
      </DashboardLayout>
    );
  }

  const PaymentsColumns = [
    { key: "amount", label: "الكمية", sortable: true },
    { key: "Details", label: "التفاصيل", sortable: true },
    { key: "date", label: "الوقت", sortable: true },
  ];

  return (
    <DashboardLayout>
      <PopupForm isOpen={isOpen} setIsOpen={setIsOpen} title={formTitle} trigger={<></>}>
        <div className="flex flex-row-reverse gap-2">
          {/* تاكيد العمليه */}
          {
            printOnly ? <></> :
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
                disabled={loading ? true : false}
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                {!loading ? 'إرسال' : 'جاري حفظ التعديلات ...'}
              </button>
            </form>
          }
          
          {/* البيانات المطبوعة */}
          <div ref={tableRef} className="p-4 text-sm" dir="rtl">
            {/* رأس الفاتورة */}
            <div className="header">
              <h1>AboOmar</h1>
              <span>{getCurrentDateTime()}</span>
            </div>
            
            {/* معلومات المشترك */}
            <div className="text-right font-bold mb-2">
              <div>اسم المشترك: {customer?.Name || "غير معروف"}</div>
              <div>الرقم: {customer?.Contact}</div>
            </div>
            
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

      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">بيانات المشترك</h1>
          <Button onClick={() => navigate("/users")} variant="outline">
            <ArrowLeft className="ml-2 w-4 h-4" /> رجوع
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailsInputs customer={customer} setCustomer={setCustomer} />
          </CardContent>
        </Card>

        <div className="flex justify-start gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              setFormTitle("اضافة فاتورة");
              setPrintOnly(false)
              setIsOpen(true);
            }}
          >
            <Plus className="w-4 h-4 ml-2" /> إضافة فاتورة
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setFormTitle("اضافة دفعة");
              setPrintOnly(false)
              setIsOpen(true);
            }}
          >
            <Plus className="w-4 h-4 ml-2" /> إضافة دفعة
          </Button>
          <Button variant="outline" onClick={reloadTransactions}>
            <RefreshCwIcon />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>البيان المالي</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loadingTransactions ? (
              <Skeleton className="h-48 w-full" />
            ) : currentItems.length === 0 ? (
              <p className="text-muted-foreground text-center">
                لا توجد معاملات حالياً.
              </p>
            ) : (
              <>
                <DataTable
                  title="البيان المالي"
                  columns={PaymentsColumns}
                  data={currentItems}
                  getRowClassName={(row) =>
                    row.type !== "payment" ? "text-red-500" : "text-green-500"
                  }
                  renderRowActions={(tx) => (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setFormTitle(tx.type === "payment" ? "اضافة دفعة" : "اضافة فاتورة")
                        setPaymentValue(tx.amount)
                        setPaymentDetails(tx.Details)
                        setPaymentDate(tx.date)
                        setPrintOnly(true)
                        setIsOpen(true)
                      }}
                    >
                      <Printer />
                    </Button>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}