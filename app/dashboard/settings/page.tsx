'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Save, Trash2, AlertTriangle, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router   = useRouter()
  const [fullName,    setFullName]    = useState('')
  const [email,       setEmail]       = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPw,   setConfirmPw]   = useState('')
  const [loading,     setLoading]     = useState<string | null>(null)
  const [deleteInput, setDeleteInput] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('full_name, email').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name ?? '')
        setEmail(data.email ?? user.email ?? '')
      }
    }
    load()
  }, [supabase])

  async function saveProfile() {
    setLoading('profile')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('users').update({ full_name: fullName }).eq('id', user.id)
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
    setLoading(null)
  }

  async function changePassword() {
    if (newPassword !== confirmPw) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading('password')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else {
      toast.success('Password updated')
      setNewPassword('')
      setConfirmPw('')
    }
    setLoading(null)
  }

  async function deleteAccount() {
    if (deleteInput !== 'delete my account') {
      toast.error('Type "delete my account" to confirm')
      return
    }
    setLoading('delete')
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete account')
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: any) {
      toast.error(err.message)
    }
    setLoading(null)
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <Input
          label="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Your full name"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          disabled
          leftIcon={<Mail className="h-4 w-4" />}
          hint="Email cannot be changed here. Contact support if needed."
        />
        <div className="flex justify-end">
          <Button
            variant="brand"
            onClick={saveProfile}
            loading={loading === 'profile'}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
        </div>
      </section>

      {/* Password */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold">Change Password</h2>
        </div>
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Min. 8 characters"
          hint="Leave blank to keep current password"
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPw}
          onChange={e => setConfirmPw(e.target.value)}
          placeholder="Repeat new password"
        />
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={changePassword}
            loading={loading === 'password'}
            disabled={!newPassword}
            className="gap-2"
          >
            Update Password
          </Button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="font-semibold text-destructive">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Input
          label='Type "delete my account" to confirm'
          value={deleteInput}
          onChange={e => setDeleteInput(e.target.value)}
          placeholder="delete my account"
        />
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={deleteAccount}
            loading={loading === 'delete'}
            disabled={deleteInput !== 'delete my account'}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </section>
    </div>
  )
}