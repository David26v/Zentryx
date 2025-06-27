"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // ✅ Make sure this is imported
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";

const ActionModal = ({ open, onClose, onSuccess, editData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { showAlert } = useAlert();

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setDescription(editData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    const payload = { name, description };

    const endpoint = editData
      ? `/api/role/update-role/${editData._id}`
      : "/api/role/create-role";

    const method = editData ? "PUT" : "POST";

    const { ok, data } = await api(endpoint, method, payload);

    if (ok) {
      showAlert(
        editData ? "Role updated successfully" : "Role created successfully",
        "success"
      );
      onSuccess();
      onClose();
    } else {
      showAlert(data.message || "Operation failed", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="rose" onClick={handleSubmit}>
            {editData ? "Update" : "Save"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActionModal;
