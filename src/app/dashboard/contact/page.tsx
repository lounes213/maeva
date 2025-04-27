'use client';
import DashboardHeader from '@/app/dashboard/components/DashboardHeader'
import React from 'react'


import { User } from 'lucide-react';
import ContactsTable from './components/contactTable';

function page({user}: {user: any}) {
  return (
    <div>
    <DashboardHeader user={{user}} />
     <div className="p-10">
          <span className="flex items-center">
      <span className="shrink-0 pe-4 text-gray-900">Contact </span>
    
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></span>
    </span>
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>
        <ContactsTable />
      </div>
    </div>
    </div>
  );
}
export default page