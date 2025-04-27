// app/api/orders/track/route.ts
import { NextResponse } from 'next/server';
import Order from '@/app/models/Order';
import dbConnect from '@/lib/mongo';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Tracking code is required' },
        { status: 400 }
      );
    }

    // 🚀 FIXED HERE
    const order = await Order.findOne({ trackingCode: code }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate delivery progress
    const statusOrder = ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.deliveryStatus);
    const progress = currentStatusIndex >= 0 
      ? Math.round((currentStatusIndex / (statusOrder.length - 1)) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        progress,
        isDelivered: order.deliveryStatus === 'delivered',
        isCancelled: order.deliveryStatus === 'cancelled',
        estimatedDelivery: order.shipping?.estimatedDelivery || null,
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
