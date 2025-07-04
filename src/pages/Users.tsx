import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import getWifiCustomers from "@/services/wifi";
import { Users as UsersIcon, Table, LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation, useNavigate } from "react-router-dom";
import PopupForm from "@/components/ui/custom/PopupForm";
import AddCustomerForm from "@/components/customers/AddCustomerForm";


export default function Users() {
  const navigate = useNavigate()
  const location = useLocation()

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSender, setSelectedSender] = useState("all");
  const [selectedSpeed, setSelectedSpeed] = useState("all");
  const [selectedDealer, setSelectedDealer] = useState("all");
  const [selectedBalance, setSelectedBalance] = useState("all");

  const [isOpen, setIsOpen] = useState(false);

  const getCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWifiCustomers();
      if (res?.success) {
        setCustomers(res.customers);
      } else {
        setError(res?.error || "فشل جلب البيانات");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomers();
    if(location.state == 'unpaid'){
      setSelectedBalance('noBalance')
    }
  }, []);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredCustomers = customers.filter((customer) => {
    const matchSearch =
      customer.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.UserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.Contact.includes(searchQuery);

    const matchSender =
      selectedSender !== "all" ? customer.sender === selectedSender : true;

    const matchSpeed =
      selectedSpeed !== "all"
        ? customer.SubscriptionSpeed === selectedSpeed
        : true;
    
    const matchDealer =
      selectedDealer !== "all"
        ? customer.dealer === selectedDealer
        : true;

    const matchBalance =
      selectedBalance === "noBalance"
        ? customer.Balance < 0
        : selectedBalance === "hasBalance"
        ? customer.Balance > 0
        : selectedBalance === "BalanceZero"
        ? customer.Balance == 0
        : true;

    return matchSearch && matchSender && matchSpeed && matchBalance && matchDealer;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentItems = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSender("all");
    setSelectedSpeed("all");
    setSelectedBalance("all");
  };

  const exportToExcel = () => {
    const exportData = filteredCustomers.map((c) => ({
      الاسم: c.Name,
      اسم_المستخدم: c.UserName,
      كلمة_السر: c.Password,
      الرصيد: c.Balance,
      الاشتراك: c.MonthlyFee,
      السرعة: c.SubscriptionSpeed,
      الهاتف: c.Contact,
      المرسل: c.sender,
      الموقع: c.location,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "المشتركين");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "المشتركين.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.text("قائمة المشتركين", 14, 10);

    const tableData = filteredCustomers.map((c) => [
      c.Name,
      c.UserName,
      c.Password,
      `${c.Balance} $`,
      `${c.MonthlyFee} $`,
      `${c.SubscriptionSpeed} Mbps`,
      c.Contact,
      c.sender,
      c.location,
    ]);

    autoTable(doc, {
      head: [[
        "الاسم",
        "اسم المستخدم",
        "كلمة السر",
        "الرصيد",
        "الاشتراك",
        "السرعة",
        "الهاتف",
        "المرسل",
        "الموقع",
      ]],
      body: tableData,
      styles: { fontSize: 8 },
      startY: 20,
    });

    doc.save("المشتركين.pdf");
  };



  return (
    <DashboardLayout>

      <PopupForm isOpen={isOpen} setIsOpen={setIsOpen} title={'إضافة اشتراك جديد'} 
        trigger={<>  
          <Button
            variant="accent"
            className="fixed bottom-4 right-5 shadow-lg rounded-full p-3"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </>
      }>
          <AddCustomerForm></AddCustomerForm>
      </PopupForm>

      <div dir="rtl" className="space-y-6">
        {/* Header */}
        <div className="-mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">المشتركين</h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              عرض كبطاقات
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              onClick={() => setViewMode("table")}
            >
              <Table className="w-4 h-4 mr-2" />
              عرض كجدول
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <UsersIcon className="h-6 w-6 text-muted-foreground" />
              <CardTitle>قائمة المشتركين ({filteredCustomers.length})</CardTitle>
            </div>
              <span>
                مجموع السرعات : {filteredCustomers.reduce((sum, ele) => sum + +ele.SubscriptionSpeed, 0)}
              </span>
          </CardHeader>

          {/* 🔍 البحث والتصفية */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-4 pb-4">
            {/* البحث */}
            <Input
              placeholder="🔍 ابحث بالاسم أو الهاتف أو اسم المستخدم"
              className="w-full md:max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* الفلاتر */}
            <div className="flex gap-4 flex-wrap">
              {/* المرسل */}
              <Select value={selectedSender} onValueChange={setSelectedSender}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="المرسل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {[...new Set(customers.map((c) => c.sender))]
                    .filter(Boolean)
                    .map((sender) => (
                      <SelectItem key={sender} value={sender}>
                        {sender}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* السرعة */}
              <Select value={selectedSpeed} onValueChange={setSelectedSpeed}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="السرعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {[...new Set(customers.map((c) => c.SubscriptionSpeed))]
                    .filter(Boolean)
                    .map((speed) => (
                      <SelectItem key={speed} value={speed}>
                        {speed} Mbps
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            
              {/* السرعة */}
              <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="البائع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {[...new Set(customers.map((c) => c.dealer))]
                    .filter(Boolean)
                    .map((dealer) => (
                      <SelectItem key={dealer} value={dealer}>
                        {dealer}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* الرصيد */}
              <Select
                value={selectedBalance}
                onValueChange={setSelectedBalance}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="الرصيد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="BalanceZero">0 رصيد</SelectItem>
                  <SelectItem value="noBalance">بدون رصيد</SelectItem>
                  <SelectItem value="hasBalance">مع رصيد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* زر إعادة الضبط */}
            <Button variant="ghost" onClick={resetFilters}>
              إعادة ضبط
            </Button>
          </div>

          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <p className="text-red-600 text-center">{error}</p>
            ) : currentItems.length === 0 ? (
              <p className="text-muted-foreground text-center">لا يوجد مشتركين.</p>
            ) : viewMode === "cards" ? (
              <div dir="rtl" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((customer) => (
                  <Card key={customer.id} className="shadow-sm">
                    <CardContent className="p-4 space-y-1" onClick={()=>{
                      navigate(`/CustomerDetails/${customer.id}`)
                    }}>
                      <p><strong>الاسم:</strong> {customer.Name}</p>
                      <p><strong>اسم المستخدم:</strong> {customer.UserName}</p>
                      <p><strong>الرصيد:</strong> {customer.Balance} USD</p>
                      <p><strong>الهاتف:</strong> {customer.Contact}</p>
                      <p><strong>المرسل:</strong> {customer.sender}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">#</th>
                      <th className="border px-2 py-1">الاسم</th>
                      <th className="border px-2 py-1">اسم المستخدم</th>
                      <th className="border px-2 py-1">كلمة السر</th>
                      <th className="border px-2 py-1">الرصيد</th>
                      <th className="border px-2 py-1">الاشتراك</th>
                      <th className="border px-2 py-1">السرعة</th>
                      <th className="border px-2 py-1">الهاتف</th>
                      <th className="border px-2 py-1">المرسل</th>
                      <th className="border px-2 py-1">الموقع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((customer, i) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="border px-2 py-1">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                        <td className="border px-2 py-1">{customer.Name}</td>
                        <td className="border px-2 py-1">{customer.UserName}</td>
                        <td className="border px-2 py-1">{customer.Password}</td>
                        <td className="border px-2 py-1">{customer.Balance} USD</td>
                        <td className="border px-2 py-1">{customer.MonthlyFee} USD</td>
                        <td className="border px-2 py-1">{customer.SubscriptionSpeed} Mbps</td>
                        <td className="border px-2 py-1">{customer.Contact}</td>
                        <td className="border px-2 py-1">{customer.sender}</td>
                        <td className="border px-2 py-1">{customer.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {/*<div className="flex flex-wrap gap-2 mb-4 mr-6">
            <Button variant="outline" onClick={exportToExcel}>
              📥 تصدير إلى Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              📄 تصدير إلى PDF
            </Button>
          </div>*/}

        </Card>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div dir="rtl" className="flex justify-center items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              variant="outline"
            >
              السابق
            </Button>
            <span className="text-muted-foreground">
              صفحة {currentPage} من {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              variant="outline"
            >
              التالي
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
