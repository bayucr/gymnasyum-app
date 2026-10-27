"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Bell, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    schedulesToday: 0,
    pendingReminders: 0,
    highRiskCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    async function loadDashboardData() {
      try {
        const [custRes, schedRes, remRes] = await Promise.all([
          fetch("/api/customers").then((r) => r.json()),
          fetch("/api/schedules").then((r) => r.json()),
          fetch("/api/reminders").then((r) => r.json()),
        ]);

        if (!isSubscribed) return;

        const customers = custRes.data || [];
        const schedules = schedRes.data || [];
        const reminders = remRes.data || [];

        // 1. Total Customers
        const totalCust = customers.length;

        // 2. Schedules Today
        const todayStr = new Date().toDateString();
        const schedTodayCount = schedules.filter((s: { datetime: string }) => {
          return new Date(s.datetime).toDateString() === todayStr;
        }).length;

        // 3. Pending Reminders (Draft / Failed)
        const pendingRemCount = reminders.filter(
          (r: { status: string }) =>
            r.status === "Draft" || r.status === "Failed",
        ).length;

        // 4. High Risk Customers (Batal > 3 kali atau Kehadiran < 50%)
        const highRiskCount = customers.filter(
          (c: { cancellation_count: number; attendance_rate: number }) =>
            (c.cancellation_count ?? 0) >= 3 || (c.attendance_rate ?? 1) < 0.5,
        ).length;

        setStats({
          totalCustomers: totalCust,
          schedulesToday: schedTodayCount,
          pendingReminders: pendingRemCount,
          highRiskCustomers: highRiskCount,
        });
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Overview Operations
        </h1>
        <p className="text-sm text-slate-500">
          Ringkasan aktivitas pelanggan dan jadwal reminder hari ini.
        </p>
      </div>

      {/* Stat Cards Ringkas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Customer
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "-" : stats.totalCustomers}
            </div>
            <p className="text-xs text-slate-500">Pelanggan terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Jadwal Hari Ini
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "-" : stats.schedulesToday}
            </div>
            <p className="text-xs text-slate-500">Sesi kelas berjalan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Reminder Pending
            </CardTitle>
            <Bell className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "-" : stats.pendingReminders}
            </div>
            <p className="text-xs text-slate-500">Perlu di-follow up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Prioritas High
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "-" : stats.highRiskCustomers}
            </div>
            <p className="text-xs text-slate-500">Risiko pembatalan tinggi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
