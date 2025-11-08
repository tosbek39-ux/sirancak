import { supabase, convertUserFromDb, convertLeaveRequestFromDb, convertUserToDb, convertLeaveRequestToDb } from './supabaseClient'
import type { User, Department, LeaveType, LeaveRequest, Notification, LogEntry } from '@/types'

// Users service
export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    return data?.map(convertUserFromDb) || []
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', id)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data ? convertUserFromDb(data) : null
  },

  async getByNip(nip: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('nip', nip)
      .single()

    if (error) {
      console.error('Error fetching user by NIP:', error)
      return null
    }

    return data ? convertUserFromDb(data) : null
  },

  async create(user: User): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(convertUserToDb(user))
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      throw error
    }

    return convertUserFromDb(data)
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(convertUserToDb(updates))
      .eq('user_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }

    return convertUserFromDb(data)
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', id)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }

    return true
  },

  async getByDepartment(departmentId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('department_id', departmentId)
      .order('name')

    if (error) {
      console.error('Error fetching users by department:', error)
      throw error
    }

    return data?.map(convertUserFromDb) || []
  },

  async getByRole(role: 'Admin' | 'Employee'): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('name')

    if (error) {
      console.error('Error fetching users by role:', error)
      throw error
    }

    return data?.map(convertUserFromDb) || []
  }
}

// ✅ DEPARTMENTS SERVICE - LENGKAP DENGAN CREATE, UPDATE, DELETE
export const departmentsService = {
  async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching departments:', error)
      throw error
    }

    return data?.map(dept => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept.employee_count
    })) || []
  },

  async getById(id: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching department:', error)
      return null
    }

    return data ? {
      id: data.id,
      name: data.name,
      employeeCount: data.employee_count
    } : null
  },

  // ✅ CREATE DEPARTMENT
  async create(department: { name: string }): Promise<Department> {
    // Generate ID dari nama department
    const id = department.name.toLowerCase().replace(/\s+/g, '-')
    
    const { data, error } = await supabase
      .from('departments')
      .insert({
        id: id,
        name: department.name,
        employee_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating department:', error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      employeeCount: data.employee_count
    }
  },

  // ✅ UPDATE DEPARTMENT
  async update(id: string, updates: Partial<Department>): Promise<Department> {
    const updateData: any = {}
    
    if (updates.name !== undefined) {
      updateData.name = updates.name
    }
    if (updates.employeeCount !== undefined) {
      updateData.employee_count = updates.employeeCount
    }

    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating department:', error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      employeeCount: data.employee_count
    }
  },

  // ✅ DELETE DEPARTMENT
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting department:', error)
      throw error
    }

    return true
  }
}

// Leave types service
export const leaveTypesService = {
  async getAll(): Promise<LeaveType[]> {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching leave types:', error)
      throw error
    }

    return data?.map(type => ({
      id: type.id,
      name: type.name
    })) || []
  },

  async getById(id: string): Promise<LeaveType | null> {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching leave type:', error)
      return null
    }

    return data ? {
      id: data.id,
      name: data.name
    } : null
  }
}

// App settings service
export const appSettingsService = {
  async getSettings() {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 'global')
      .single()

    if (error) {
      console.error('Error fetching app settings:', error)
      return {
        id: 'global',
        logoUrl: '/logo.png',
        companyName: 'Leave Management System',
        letterhead: ['Company Name'],
        sickLeaveFormUrl: '',
        contactInfo: {},
        themeConfig: {}
      }
    }

    return {
      id: data.id,
      logoUrl: data.logo_url,
      companyName: data.company_name,
      letterhead: data.letterhead,
      sickLeaveFormUrl: data.sick_leave_form_url,
      contactInfo: data.contact_info,
      themeConfig: data.theme_config
    }
  },

  async updateSettings(settings: {
    logoUrl?: string
    companyName?: string
    letterhead?: string[]
    sickLeaveFormUrl?: string
    contactInfo?: any
    themeConfig?: any
  }) {
    const updateData: any = {}
    
    if (settings.logoUrl) updateData.logo_url = settings.logoUrl
    if (settings.companyName) updateData.company_name = settings.companyName
    if (settings.letterhead) updateData.letterhead = settings.letterhead
    if (settings.sickLeaveFormUrl) updateData.sick_leave_form_url = settings.sickLeaveFormUrl
    if (settings.contactInfo) updateData.contact_info = settings.contactInfo
    if (settings.themeConfig) updateData.theme_config = settings.themeConfig

    const { data, error } = await supabase
      .from('app_settings')
      .update(updateData)
      .eq('id', 'global')
      .select()
      .single()

    if (error) {
      console.error('Error updating app settings:', error)
      throw error
    }

    return {
      id: data.id,
      logoUrl: data.logo_url,
      companyName: data.company_name,
      letterhead: data.letterhead,
      sickLeaveFormUrl: data.sick_leave_form_url,
      contactInfo: data.contact_info,
      themeConfig: data.theme_config
    }
  }
}

// Leave requests service
export const leaveRequestsService = {
  async getAll(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leave requests:', error)
      throw error
    }

    return data?.map(convertLeaveRequestFromDb) || []
  },

  async getById(id: string): Promise<LeaveRequest | null> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('request_id', id)
      .single()

    if (error) {
      console.error('Error fetching leave request:', error)
      return null
    }

    return data ? convertLeaveRequestFromDb(data) : null
  },

  async getByUser(userId: string): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leave requests by user:', error)
      throw error
    }

    return data?.map(convertLeaveRequestFromDb) || []
  },

  async getPendingApprovals(approverId: string): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('status', 'Pending')
      .eq('next_approver_id', approverId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending approvals:', error)
      throw error
    }

    return data?.map(convertLeaveRequestFromDb) || []
  },

  async create(request: LeaveRequest): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(convertLeaveRequestToDb(request))
      .select()
      .single()

    if (error) {
      console.error('Error creating leave request:', error)
      throw error
    }

    return convertLeaveRequestFromDb(data)
  },

  async update(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(convertLeaveRequestToDb(updates))
      .eq('request_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating leave request:', error)
      throw error
    }

    return convertLeaveRequestFromDb(data)
  },

  async updateStatus(id: string, status: LeaveRequest['status'], nextApproverId?: string): Promise<LeaveRequest> {
    const updates: any = { status }
    if (nextApproverId !== undefined) {
      updates.next_approver_id = nextApproverId
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('request_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating leave request status:', error)
      throw error
    }

    return convertLeaveRequestFromDb(data)
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('request_id', id)

    if (error) {
      console.error('Error deleting leave request:', error)
      throw error
    }

    return true
  }
}

// Notifications service
export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all notifications:', error)
      throw error
    }

    return data?.map(notif => ({
      id: notif.id,
      userId: notif.user_id,
      message: notif.message,
      type: notif.type,
      isRead: notif.is_read,
      createdAt: new Date(notif.created_at),
      leaveRequestId: notif.leave_request_id || undefined
    })) || []
  },

  async getByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }

    return data?.map(notif => ({
      id: notif.id,
      userId: notif.user_id,
      message: notif.message,
      type: notif.type,
      isRead: notif.is_read,
      createdAt: new Date(notif.created_at),
      leaveRequestId: notif.leave_request_id || undefined
    })) || []
  },

  async create(notification: Omit<Notification, 'id'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        message: notification.message,
        type: notification.type,
        is_read: notification.isRead,
        leave_request_id: notification.leaveRequestId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      throw error
    }

    return {
      id: data.id,
      userId: data.user_id,
      message: data.message,
      type: data.type,
      isRead: data.is_read,
      createdAt: new Date(data.created_at),
      leaveRequestId: data.leave_request_id || undefined
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }

    return true
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }

    return true
  }
}

// Log entries service
export const logEntriesService = {
  async getAll(): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from('log_entries')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching log entries:', error)
      throw error
    }

    return data?.map(log => ({
      id: log.id,
      date: new Date(log.date),
      user: log.user,
      activity: log.activity
    })) || []
  },

  async create(logEntry: Omit<LogEntry, 'id'>): Promise<LogEntry> {
    const { data, error } = await supabase
      .from('log_entries')
      .insert({
        date: logEntry.date.toISOString(),
        user: logEntry.user,
        activity: logEntry.activity
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating log entry:', error)
      throw error
    }

    return {
      id: data.id,
      date: new Date(data.date),
      user: data.user,
      activity: data.activity
    }
  }
}

// Department approval flows
export const departmentApprovalFlows: { [key: string]: string[] } = {
  'hr': ['5', 'admin'],
  'it': ['2', 'admin'],
  'finance': ['7', 'admin'],
  'marketing': ['8', 'admin']
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToLeaveRequests(callback: (payload: any) => void) {
    return supabase
      .channel('leave_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leave_requests' }, 
        callback
      )
      .subscribe()
  },

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        callback
      )
      .subscribe()
  }
}
