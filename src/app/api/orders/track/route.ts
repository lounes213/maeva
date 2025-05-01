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
        { success: false, message: 'Le code de suivi est requis' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ trackingCode: code });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Calcul de la progression de la livraison
    const statusOrder = ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.deliveryStatus);
    const progress = currentStatusIndex >= 0 
      ? Math.round((currentStatusIndex / (statusOrder.length - 1)) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...order.toObject(),
        progress,
        isDelivered: order.deliveryStatus === 'delivered',
        isCancelled: order.deliveryStatus === 'cancelled',
        estimatedDelivery: order.shipping.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Erreur lors du suivi de la commande:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}