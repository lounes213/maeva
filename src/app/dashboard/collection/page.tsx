import DashboardHeader from '@/app/dashboard/components/DashboardHeader'
import React from 'react'

import CollectionTable from './components/collectionTable'



function page() {
  return (
    <div>
    <DashboardHeader user={{}} />
     <div className="p-10">
          <span className="flex items-center">
      <span className="shrink-0 pe-4 text-gray-900">Categories</span>
    
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></span>
    
    </span>
    
          </div>
    
    <section>
    <CollectionTable/>
    </section>
    </div>
  )
}

export default page