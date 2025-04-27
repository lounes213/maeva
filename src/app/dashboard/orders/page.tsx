import DashboardHeader from '@/app/dashboard/components/DashboardHeader'
import React from 'react'
import OrderTable from './components/orderTable'


export default function page ({ user }: { user: any })  {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
    
         <DashboardHeader user={user} />
        
  
    
      <div className="p-10 mt-16 bg-gray-100 min-h-screen">
      <div>
      <OrderTable />
      </div>
      </div>
    </div>
  )
}