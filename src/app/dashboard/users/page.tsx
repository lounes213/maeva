import DashboardHeader from '@/app/dashboard/components/DashboardHeader'
import React from 'react'
import UsersTable from './components/UsersTable'

function UsersPage() {
  return (
    <div>
      <DashboardHeader user={{}} />
      <div className="p-10">
        <span className="flex items-center">
          <span className="shrink-0 pe-4 text-gray-900">Gestion des Utilisateurs</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></span>
        </span>
      </div>
      
      <section className="px-6">
        <UsersTable />
      </section>
    </div>
  )
}

export default UsersPage