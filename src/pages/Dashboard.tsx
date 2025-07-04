import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CreditCard,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { apiService, User, Post } from "@/services/api";
import getWifiCustomers from "@/services/wifi";
import getTodyBalance, { getBalanceByDate } from "@/services/balance";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate()

  const [totalBalance, setTotalBalance] = useState(0)
  const [customers, setCustomers] = useState([])
  const [todayBalance, setTodayBalance] = useState([])
  const [monthBalance, setMonthBalance] = useState([])
  const [balanceDate, setBalanceDate] = useState('')

  const getMonthTable = async () => {
    const res = await getBalanceByDate("");
    if(res?.success){
      setMonthBalance(res.BalanceTable);
    }else{
      console.error(res)
    }
  }

  const getCustomers = async () => {
    const res = await getWifiCustomers();

    if (res?.success) {
      setCustomers(res.customers);

    } else {
      alert(res?.error || "لم يتم العثور على بيانات");
    }
  };
  
  const getBalance = async () => {
    const res = await getTodyBalance("")
    if (res?.success) {
      setTodayBalance(res.BalanceTable);
  
    } else {
      console.log(res?.error || "لم يتم العثور على بيانات");
    }
    console.log(res)
  }

  useEffect(() => {
    getCustomers();
    getBalance();
    getMonthTable();
  }, []);


  const totalSpeed = useMemo(() => {
    return customers.reduce((sum, c) => sum + Number(c.SubscriptionSpeed), 0);
  }, [customers]);

  const unpaidValue = useMemo(() => {
    const totalDebt = customers
      .filter(c => c.Balance < 0)
      .reduce((sum, c) => sum + Number(c.Balance), 0);

    return Math.abs(totalDebt);
  }, [customers]);

  useEffect(()=>{

    let temValue = 0
    todayBalance.forEach(ele => {
      temValue += ele.total
    })
    setTotalBalance(temValue)

  }, [todayBalance])

  // Fetch dashboard data using React Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: apiService.getDashboardStats,
  });


  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: apiService.getUsers,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: apiService.getPosts,
  });

  // Transform data for tables
  const userTableData =
    users?.slice(0, 10).map((user: User) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company.name,
      status: Math.random() > 0.5 ? "active" : "inactive",
    })) || [];

  const postTableData =
    posts?.slice(0, 8).map((post: Post) => ({
      id: post.id,
      title: post.title.substring(0, 50) + "...",
      author: `User ${post.userId}`,
      status: Math.random() > 0.3 ? "published" : "draft",
      date: new Date().toLocaleDateString(),
    })) || [];

  const userColumns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  const postColumns = [
    { key: "id", label: "ID", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "author", label: "Author", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "date", label: "Date", sortable: true },
  ];

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            onClick={()=>{
              navigate('/AboOmar/users')
            }}
            title="عدد مشتركين الفضائي"
            value={customers.length || 0}
            description="from last month"
            icon={Users}
            trend={{ value: stats?.userGrowth || 0, isPositive: true }}
          />
          <StatsCard
            onClick={()=>{
              navigate('/AboOmar/users', {state: 'unpaid'})
            }}
            title="الفواتير الغير مدفوعة"
            value={unpaidValue || 0}
            description=""
            icon={CreditCard}
            trend={{ value: stats?.userGrowth || 0, isPositive: true }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2 text-center">
          <ChartContainer
            className="mdL:col-span-2"
            title=" توزع المرسلات "
            data={

              customers.reduce((acc, customer) => {
                const sender = (customer.sender ?? '').trim();
                const SubscriptionSpeed = Number(customer.SubscriptionSpeed);

                const existing = acc.find(item => item.sender === sender);

                if (existing) {
                  existing.totalSpeed += SubscriptionSpeed;
                  existing.customerCount += 1;
                } else {
                  acc.push({
                    sender,
                    totalSpeed: SubscriptionSpeed,
                    customerCount: 1
                  });
                }
              
                return acc;
              }, [])
            
            }
            type="bar"
            dataKey2='customerCount'
            dataKey="totalSpeed"
          />
          <ChartContainer
            title="عدد المشتركين حسب السرعة"
            type="pie"
            dataKey="value"
            data={
              Object.values(
                customers.reduce(
                  (acc: Record<string, { name: string; value: number }>, customer: any) => {
                    const speed = customer.SubscriptionSpeed || "غير محددة";
                    if (!acc[speed]) {
                      acc[speed] = { name: `${speed} Mbps`, value: 0 };
                    }
                    acc[speed].value += 1;
                    return acc;
                  },
                  {}
                )
              )
            }
            desc={
              totalSpeed.toString() + ' Mbps'
            }
          />

        </div>

      </div>
    </DashboardLayout>
  );
}
