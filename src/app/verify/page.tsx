'use client';
import DashboardHeader from '@/app/dashboard/components/DashboardHeader';
import OrderStatusForm from '@/app/components/OrderStatusForm';
import { CgShoppingCart } from 'react-icons/cg';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';

export default function VerifyPage() {
  const { user } = useKindeAuth();

  return (
    <div>
      <DashboardHeader user={user} />
      <div className="p-10">
        <div className="flex items-center">
          <span className="shrink-0 pe-4 text-gray-900 text-lg font-medium">Orders Verification</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></span>
          <button
            className="inline-flex items-center gap-2 rounded-sm border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <CgShoppingCart className="h-5 w-5" />
            Orders
          </button>
        </div>
      </div>
      <div className="mt-6 px-10">
        <OrderStatusForm />
      </div>
    </div>
  );
}