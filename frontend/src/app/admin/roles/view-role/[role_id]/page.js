'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAlert } from '@/components/providers/AlertProvider'
import { useDialog } from '@/components/providers/DialogProvider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea' // Add this if using a Textarea component
import { api } from '@/lib/helper'

const RoleViewPage = () => {
  const { role_id } = useParams()
  const { showAlert } = useAlert()
  const { showProfile } = useDialog()
  const fileInputRef = useRef(null)

  const [role, setRole] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', active: false, avatar: '' })
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { ok, data } = await api(`/api/role/get-role/${role_id}`, 'GET')
        if (ok && data.role) {
          setRole(data.role)
          setForm({
            name: data.role.name || '',
            description: data.role.description || '',
            active: data.role.active ?? false,
            avatar: data.role.avatar || ''
          })
        } else {
          showAlert('Failed to load role', 'error')
        }
      } catch (err) {
        console.error(err)
        showAlert('Error loading role', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (role_id) fetchRole()
  }, [role_id])

  const handleSave = async () => {
    showProfile({
      title: 'Update Role',
      description: 'Are you sure you want to update this role?',
      onConfirm: async () => {
        try {
          let avatarUrl = form.avatar

          if (selectedAvatar) {
            const formData = new FormData()
            formData.append('avatar', selectedAvatar)
            formData.append('role_id', role_id)

            const { ok, data } = await api('/api/role/upload-avatar', 'POST', formData)
            if (!ok) throw new Error(data.message || 'Avatar upload failed')

            avatarUrl = data.avatarUrl
          }

          const { ok, data } = await api(`/api/role/update-role/${role_id}`, 'PUT', {
            name: form.name,
            description: form.description,
            active: form.active,
            avatar: avatarUrl
          })

          if (ok) {
            setIsEdit(false)
            showAlert('Role updated successfully', 'success')
            setRole(data.updatedRole)
          } else {
            showAlert(data.message || 'Update failed', 'error')
          }
        } catch (err) {
          console.error(err)
          showAlert('Something went wrong', 'error')
        }
      },
      onCancel: () => showAlert('Update cancelled', 'info'),
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file)
      setForm(prev => ({ ...prev, avatar: previewUrl }))
      setSelectedAvatar(file)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading role...</div>
  if (!role) return <div className="p-6 text-center">Role not found.</div>

  return (
    <div className="p-6 max-w-xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-md">
      <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">← Back</Button>

      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <img
          src={form.avatar || '/default-avatar.png'}
          alt="Role Avatar"
          className="w-28 h-28 rounded-full object-cover border shadow cursor-pointer"
          onClick={() => isEdit && fileInputRef.current?.click()}
        />
        {isEdit && (
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
        )}
      </div>

      {/* Title of Role (editable under avatar) */}
      <div className="text-center mb-6">
        {isEdit ? (
          <Input
            className="text-xl font-bold text-center"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        ) : (
          <h1 className="text-2xl font-bold">{form.name}</h1>
        )}
      </div>

      {/* Status Switch */}
      <div className="flex justify-between items-center mt-4">
        <Label>Status</Label>
        <Switch
          checked={form.active}
          disabled={!isEdit}
          onCheckedChange={(checked) => setForm({ ...form, active: checked })}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Label>Description</Label>
        {isEdit ? (
          <Textarea
            className="mt-1"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        ) : (
          <p className="mt-1 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
            {form.description || 'No description'}
          </p>
        )}
      </div>



      {/* Footer */}
      <div className="flex justify-end mt-6 gap-3">
        {isEdit ? (
          <>
            <Button variant="secondary" onClick={() => setIsEdit(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </>
        ) : (
          <Button onClick={() => setIsEdit(true)}>Edit</Button>
        )}
      </div>
    </div>
  )
}

export default RoleViewPage
