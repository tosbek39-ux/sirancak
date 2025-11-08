'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  getLeaveRequests,
  getUsers,
  getDepartments,
  getLeaveTypes,
  getUserById,
  getDepartmentById,
  getLeaveTypeById
} from '@/lib/data-supabase';
import { LeaveLetter } from '@/components/leave-letter';
import { Skeleton } from '@/components/ui/skeleton';
import type { LeaveRequest, User, Department, LeaveType } from '@/types';

export default function PrintLeaveRequestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const letterNumber = searchParams.get('letterNumber') || '.......................';

  const [letterData, setLetterData] = useState<{
    request: LeaveRequest;
    user: User;
    department: Department;
    leaveType?: LeaveType;
    letterNumber: string;
    approver?: User;
    headOfAgency?: User;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const printTriggered = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const [allRequests, allUsers] = await Promise.all([
          getLeaveRequests(),
          getUsers(),
        ]);
        
        const request = allRequests.find((r) => r.id === id);
        if (request) {
          const user = await getUserById(request.userId);
          const department = user ? await getDepartmentById(user.departmentId) : undefined;
          const leaveType = await getLeaveTypeById(request.leaveTypeId);
          
          if (user && department) {
              const approver = allUsers.find(u => u.id === '2'); 
              const headOfAgency = allUsers.find(u => u.role === 'Admin');

              setLetterData({
                request,
                user,
                department,
                leaveType,
                letterNumber,
                approver,
                headOfAgency,
              });
          }
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id, letterNumber]);
  
  useEffect(() => {
    // Trigger print only after data has been loaded and rendered
    if (!isLoading && letterData && !printTriggered.current) {
        printTriggered.current = true; // Prevent multiple print triggers
        setTimeout(() => {
            window.print();
        }, 500); // A small delay to ensure content is fully rendered
    }
  }, [isLoading, letterData]);
  
  if (isLoading) {
    return (
      <div className="p-10 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  
  if (!letterData) {
     return (
       <div className="p-10 bg-white text-center">
         <p>Data tidak ditemukan. Silakan periksa kembali ID permintaan cuti.</p>
       </div>
     );
  }

  return (
    <div className="bg-white text-black">
      <LeaveLetter {...letterData} />
    </div>
  );
}
