"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, UserCog, XCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";
import ActionModal from "./components/ActionModal";
import FilterRole from "./components/FilterRole";
import { useDialog } from "@/components/providers/DialogProvider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const Role = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const router = useRouter();



  const handleCreate = () => {
    setEditData(null); 
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setEditData(null); 
  };
  
  const handleFilter = () => setFilterOpen(true);
  const handleFilterClose = () => setFilterOpen(false);

  const { showAlert } = useAlert();
  const { showDelete } = useDialog();

  const fetchRoles = async () => {
    try {
      const { ok, data } = await api("/api/role/get-all-role", "GET");
      if (ok) {
        setRoles(data.roles || []);
        console.log("data", data);
      } else {
        showAlert(`Error Fetching Roles:${data.message}`, "error");
      }
    } catch (error) {
      showAlert(`Error Fetching Roles:${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = (id) => {
    showDelete({
      title: "Delete Role",
      description:
        "Are you sure you want to delete this role? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const { ok, data } = await api(
            `/api/role/delete-role/${id}`,
            "DELETE"
          );

          if (ok) {
            setRoles((prev) => prev.filter((r) => r._id !== id));
            showAlert("Role deleted successfully", "success");
          } else {
            showAlert(`Failed to delete role: ${data.message}`, "error");
          }
        } catch (error) {
          console.error("Delete error:", error);
          showAlert("An error occurred while deleting the role", "error");
        }
      },
      onCancel: () => showAlert("Delete cancelled", "info"),
    });
  };

  const handleSuccess = () => {
    fetchRoles();
    setOpen(false);
  };

  const handleApplyFilter = (value) => {
    console.log("Filter applied:", value);
  };
  const ViewPage = (role_id) => {
    router.push(`/admin/roles/view-role/${role_id}`);
  };

  return (
    <div className="p-6">
      <ActionModal
        open={open}
        onClose={handleClose}
        onSuccess={handleSuccess}
        editData={editData}
      />


      <FilterRole
        open={filterOpen}
        onClose={handleFilterClose}
        onApply={handleApplyFilter}
      />

      <PageHeader
        title="Roles"
        onCreate={handleCreate}
        onImport={() => console.log("Import clicked")}
        onExport={() => console.log("Export clicked")}
        onFilter={handleFilter}
        showCreate
        showImportExport
        showFilter
      />

      {loading ? (
        <p>Loading...</p>
      ) : roles.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card
            className="rounded-2xl shadow p-4 hover:shadow-md transition text-center cursor-pointer"
            onClick={handleCreate}
          >
            <CardContent className="flex flex-col items-center justify-center h-40">
              <XCircle size={36} className="text-gray-400 mb-2" />
              <h2 className="text-lg font-semibold">No Roles Available</h2>
              <p className="text-sm text-gray-500">
                Click this card or "Create Role" to add a new one.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
         {roles.map((role) => (
          <Card
            key={role._id}
            className="w-full max-w-sm rounded-2xl shadow-md hover:shadow-lg transition border border-gray-200 dark:border-gray-800"
          >
            <CardContent className="flex flex-col justify-between min-h-[200px] p-4 space-y-4">
              {/* Top: Role Info & Actions */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <UserCog className="text-blue-600" size={24} />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h2>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Eye
                    size={18}
                    className="text-gray-400 hover:text-blue-500 cursor-pointer"
                    title="View"
                    onClick={() => ViewPage(role._id)}
                  />
                  <Pencil
                    size={18}
                    className="text-gray-400 hover:text-green-500 cursor-pointer"
                    title="Edit"
                    onClick={() => {
                      setEditData(role);
                      setOpen(true);
                    }}
                  />

                  <Trash2
                    size={18}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Delete"
                    onClick={() => handleDelete(role._id)}
                  />
                </div>
              </div>

              {/* Dummy Avatars */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                {role.assignedUsers && role.assignedUsers.length > 0 ? (
                  <div className="flex -space-x-3 mt-2">
                    {role.assignedUsers.map((user, index) => (
                      <Avatar key={index} className="w-8 h-8 border-2 border-white">
                        <AvatarImage src={user.avatar || `/avatars/${index + 1}.png`} />
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No assigned users</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
};

export default Role;
