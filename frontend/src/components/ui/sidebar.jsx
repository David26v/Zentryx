"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  UserCog,
  User2,
  CalendarDays,
  Wallet,
  Briefcase,
  BarChart,
  Activity,
  Settings,
  FileClock,
  ClipboardCheck,
} from "lucide-react";

const Sidebar = ({ isOpen, role }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const activeStyle = "bg-[#826AF91A] text-[#2D99FF] font-semibold";
  const inactiveStyle = "text-gray-700";

  const admin = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Employees", icon: Briefcase, path: "/admin/employees" },
    { label: "Users", icon: UserCog, path: "/admin/users" },
    { label: "Roles", icon: User2, path: "/admin/roles" },
    { label: "Projects", icon: ClipboardCheck, path: "/admin/projects" }, // ✅ NEW
    { label: "Attendance Logs", icon: CalendarDays, path: "/admin/attendance" },
    { label: "Payroll", icon: Wallet, path: "/admin/payroll" },
    { label: "Leave Requests", icon: FileClock, path: "/admin/leave-requests" },
    { label: "Reports", icon: BarChart, path: "/admin/reports" },
    { label: "Audit Trail", icon: Activity, path: "/admin/audit-trail" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const user = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard" },
    { label: "My Tasks", icon: ClipboardCheck, path: "/user/tasks" },
    { label: "Attendance", icon: CalendarDays, path: "/user/attendance" },
    { label: "Leave Requests", icon: FileClock, path: "/user/leave-requests" },
    { label: "My Payroll", icon: Wallet, path: "/user/payroll" },
    { label: "Settings", icon: Settings, path: "/user/settings" },
  ];

  const sidebarItems = role === "admin" ? admin : user;

  return (
    <nav className="h-full bg-gray-200 p-4">
      {/* Logo and Title */}
      <div
        className={`flex items-center gap-2 mb-6 transition-all duration-300 ${
          isOpen ? "justify-start" : "justify-center"
        }`}
      >
        <Image src="/logo.png" alt="Logo" width={32} height={30} />
        {isOpen && <span className="text-lg font-bold">Zentryx</span>}
      </div>

      {/* Sidebar Items */}
      <div className="flex flex-col space-y-2">
        {sidebarItems.map((item) => (
          <Link key={item.label} href={item.path}>
            <div
              className={`flex items-center space-x-3 h-[56px] px-4 rounded-2xl cursor-pointer transition-colors ${
                activeItem === item.label
                  ? activeStyle
                  : `${inactiveStyle} hover:bg-gray-300`
              }`}
              onClick={() => handleItemClick(item.label)}
            >
              <div className="flex items-center justify-center w-10">
                <item.icon className="w-5 h-5 text-gray-700" />
              </div>
              {isOpen && <span className="text-base">{item.label}</span>}
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
