"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import SewerTable from "@/components/ui/SewerTable";
import { useRouter } from "next/navigation";
import AddEmployee from "./components/AddEmployeeModal";
import CardList from "./components/CardList";
import { useUser } from "@/components/providers/UserContext";

const Employees = () => {
  const [employee, setEmployee] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: "", plan: "", status: "" });
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();
  const router = useRouter();


  useEffect(() => {
    fetchEmployees();
  }, []);


  const fetchEmployees = async () => {
    try {
      const { ok, data } = await api("/api/employee/get-all-employees", "GET");
      setEmployee (data);
      console.log('data',data)
    } 
    catch (error) {
      console.error("Fetch users error:", error);
      setEmployee([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employee_id) => {
    showDelete({
      title: "Delete User",
      description:
        "Are you sure it will be deleted to our system but you can create another one ?",
      onConfirm: async () => {
        try {
          await api(`/api/employee/delete-employee/${employee_id}`, "DELETE");
          setEmployee((prev) => prev.filter((e) => e._id !== employee_id));
          showAlert("User deleted", "success");
          fetchUsers();
        } catch (error) {
          showAlert("Failed to delete user", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const filteredData = employee.filter((e) => {
    const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesRole = filters.role ? e.position === filters.role : true;
    const matchesStatus = filters.status && filters.status !== "all" ? e.status === filters.status : true;
    return matchesSearch && matchesRole && matchesStatus;
  });
  ;

  const columns = [
    { key: "user", name: "Full Name" },
    { key: "department", name: "Department" },
    { key: "role", name: "Role" },
    { key: "date_hired", name: "Date Hired" },
    { key: "salary", name: "Salary" },
    { key: "status", name: "Status" },
  ];
  

  const tableData = filteredData.map((employee) => ({
    _id: employee._id,
    user: {
      name: `${employee.user.first_name} ${employee.user.last_name}`,
      email: employee.user.email,
      avatar: employee.user.avatar, 
      user_id: employee.user._id,
    },
    email: employee.user.email,
    department: employee.department,
    position: employee.position,
    role: employee.role?.name || "",
    date_hired: new Date(employee.date_hired).toLocaleDateString(),
    salary: `₱${employee.salary.toLocaleString()}`,
    status: employee.status,
  }));
  
  
  

  const filterOptions = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
        { label: "Viewer", value: "viewer" },
      ],
    },
    
    {
      key: "status",
      label: "Status",
      options: [
        { label: "all", value: "all" },
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Pending", value: "Pending" },
      ],
    },
  ];

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

   const ViewPage =(employee_id)=>{
    router.push(`/admin/employees/${employee_id}`);
   }

  return (
    <div className="">
   
     
      <CardList />

      <SewerTable
        data={tableData}
        columns={columns}
        filters={filterOptions}
        search={search}
        onSearch={setSearch}
        onFilterChange={handleFilterChange}
        loading={loading}
        ButtonPlacement={<AddEmployee fetchEmployees = {fetchEmployees} />}
        onDelete={handleDelete}
        onView={(item) => {
          router.push(`/admin/employees/${item._id}`);
        }}
        
        
      />
    </div>
  );
};

export default Employees;
