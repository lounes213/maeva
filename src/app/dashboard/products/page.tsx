import React from 'react'
import ProductTable from './components/ProductTable'
import { Product } from '@/app/types/product'



const page = () => {
  return (
    <div>
      <h1 className='text-2xl font-bold'>Products</h1>
      <p className='text-gray-500'>Manage your products here.</p>
      {/* Add your product management components here */}
      <div className='mt-4'>
        {/* Example: Product Table */}
        <ProductTable products={[]} loading={false} onEdit={function (product: Product): void {
          throw new Error('Function not implemented.')
        } } onDelete={function (product: Product): void {
          throw new Error('Function not implemented.')
        } } page={0} limit={0} totalPages={0} totalItems={0} onPageChange={function (page: number): void {
          throw new Error('Function not implemented.')
        } } onLimitChange={function (limit: number): void {
          throw new Error('Function not implemented.')
        } } sortBy={''} sortOrder={''} onSort={function (field: string): void {
          throw new Error('Function not implemented.')
        } } categories={[]}        />
    </div>
    </div>
  )
}

export default page