'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { getLeaveTypes, getUsers, getLeaveRequests, getNotificationsByUser, getLeaveTypeById, getAppSettings, getUserById, logHistory, departmentApprovalFlows, createLeaveRequest } from '@/lib/data-supabase';
import type { LeaveRequest, User, Notification } from '@/types';
import Link from 'next/link';

export default function AjukanCutiPage() {
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypesData, setLeaveTypesData] = useState<any[]>([]);
  const [appSettingsData, setAppSettingsData] = useState<any>({});
  const [date, setDate] = useState<DateRange | undefined>();
  const [leaveTypeId, setLeaveTypeId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [days, setDays] = useState<number | string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const loggedInUserId = sessionStorage.getItem('loggedInUserId');
      const user = await getUserById(loggedInUserId || '1'); // Fallback for safety
      setCurrentUser(user);

      const [lt, lr, s] = await Promise.all([
        getLeaveTypes(),
        getLeaveRequests(),
        getAppSettings(),
      ]);
      setLeaveTypesData(lt);
      setLeaveRequests(lr);
      setAppSettingsData(s);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !date?.from || !date?.to || !leaveTypeId || !reason || !days) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim',
        description: 'Mohon lengkapi semua isian formulir.',
      });
      return;
    }
    
    const numDays = Number(days);
    if (numDays <= 0) {
        toast({
            variant: 'destructive',
            title: 'Jumlah hari tidak valid',
            description: 'Jumlah hari cuti harus lebih dari 0.',
        });
        return;
    }

    const selectedLeaveType = getLeaveTypeById(leaveTypeId);
    if (selectedLeaveType?.name === 'Cuti Tahunan' && numDays > currentUser.annualLeaveBalance) {
        toast({
            variant: 'destructive',
            title: 'Saldo Cuti Tidak Cukup',
            description: `Anda hanya memiliki ${currentUser.annualLeaveBalance} hari cuti tahunan tersisa.`,
        });
        return;
    }

    // Determine the first approver from the approval flow
    const approvalFlow = departmentApprovalFlows[currentUser.departmentId];
    const firstApproverId = approvalFlow && approvalFlow.length > 0 ? approvalFlow[0] : undefined;

    if (!firstApproverId) {
        toast({
            variant: 'destructive',
            title: 'Gagal Mengirim',
            description: 'Alur persetujuan untuk departemen Anda belum diatur. Hubungi Admin.',
        });
        return;
    }

    const newRequestId = `req-${Date.now()}`;
    const newRequest: LeaveRequest = {
      id: newRequestId,
      userId: currentUser.id,
      leaveTypeId: leaveTypeId,
      startDate: date.from,
      endDate: date.to,
      days: numDays,
      reason: reason,
      status: 'Pending',
      createdAt: new Date(),
      attachment: undefined,
      nextApproverId: firstApproverId, // Set the first approver
    };

    try {
      const newRequest = await createLeaveRequest({
        userId: currentUser.id,
        leaveTypeId: leaveTypeId,
        startDate: date.from,
        endDate: date.to,
        days: numDays,
        reason: reason,
        status: 'Pending',
        attachment: undefined,
        nextApproverId: firstApproverId,
      });

      // The createLeaveRequest function should handle logging and notifications internally
      // For now, we'll just update the local state with the new request
      setLeaveRequests([newRequest, ...leaveRequests]);

      toast({
        title: 'Permintaan Terkirim',
        description: 'Permintaan cuti Anda telah berhasil diajukan.',
      });
    } catch (error) {
      console.error('Failed to create leave request:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Mengirim',
        description: 'Terjadi kesalahan saat mengirim permintaan cuti. Silakan coba lagi.',
      });
    }

    // Reset form
    setDate(undefined);
    setLeaveTypeId('');
    setReason('');
    setDays('');
  };
  
  const selectedLeaveType = getLeaveTypeById(leaveTypeId);


  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajukan Cuti Baru</CardTitle>
          <CardDescription>
            Silakan isi formulir di bawah ini untuk mengajukan cuti.
            {currentUser && <p className="font-medium text-primary">Sisa Cuti Tahunan Anda: {currentUser.annualLeaveBalance} hari</p>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="leave-type">Jenis Cuti</Label>
                <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                  <SelectTrigger id="leave-type">
                    <SelectValue placeholder="Pilih Jenis Cuti" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypesData.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-range">Tanggal Cuti</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-range"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} -{' '}
                            {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pilih rentang tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">Jumlah Hari</Label>
                <Input 
                    id="days" 
                    type="number" 
                    value={days} 
                    onChange={(e) => setDays(e.target.value)} 
                    placeholder="Contoh: 3"
                />
              </div>

              {selectedLeaveType && selectedLeaveType.name === 'Cuti Sakit' && (
                <div className="space-y-2">
                    <Label htmlFor="attachment">Dokumen Pendukung</Label>
                    <Button asChild variant="outline" className="w-full">
                       <Link href={appSettingsData.sickLeaveFormUrl || '#'} target="_blank">
                         <UploadCloud className="mr-2 h-4 w-4" />
                         Unggah Dokumen via Form
                       </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground">Dokumen diunggah melalui Google Form. Anda bisa melengkapinya nanti.</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="reason">Alasan Cuti</Label>
                <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tuliskan alasan lengkap Anda di sini..."
                    rows={4}
                />
            </div>
            
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => {
                    setDate(undefined);
                    setLeaveTypeId('');
                    setReason('');
                    setDays('');
                }}>
                    Batal
                </Button>
                <Button type="submit" variant="default">Kirim Pengajuan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
