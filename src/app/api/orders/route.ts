import { NextRequest, NextResponse } from 'next/server';
import {dbConnect} from '@/lib/mongo';
import Order from '@/app/models/Order';
import { Product } from '@/app/models/Product';
import { generateTrackingCode } from '@/app/types/order';

// Types
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string;
  color?: string;
}

interface CustomerInfo {
  name: string;
  address: string;
  contact: string;
  email?: string;
}

interface ShippingInfo {
  method: string;
  cost: number;
  estimatedDelivery: string;
}

interface OrderRequest {
  items: OrderItem[];
  customer: CustomerInfo;
  shipping: ShippingInfo;
  couponDiscount?: number;
}

// Helpers
const validateOrderRequest = (body: any): { isValid: boolean; error?: string } => {
  if (!body?.items?.length) return { isValid: false, error: 'Cart items are required' };
  if (!body.customer?.name || !body.customer?.address || !body.customer?.contact) {
    return { isValid: false, error: 'Customer information is incomplete' };
  }
  if (!body.shipping?.method || body.shipping?.cost === undefined || !body.shipping?.estimatedDelivery) {
    return { isValid: false, error: 'Shipping information is incomplete' };
  }
  return { isValid: true };
};

const verifyProducts = async (items: OrderItem[]) => {
  const verifiedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    subtotal += item.price * item.quantity;
    verifiedItems.push({
      productId: item.productId,
      name: product.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl || product.imageUrls?.[0],
      size: item.size,
      color: item.color
    });
  }

  return { verifiedItems, subtotal };
};

const createOrderResponse = (data: any, status = 200) => {
  return NextResponse.json(
    { success: status < 400, ...data },
    { status }
  );
};

// API Endpoints
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { items, customer, shipping, payment } = body;

    if (!items?.length) {
      return NextResponse.json(
        { error: 'Les articles sont requis' },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.address || !customer?.contact) {
      return NextResponse.json(
        { error: 'Informations client incomplètes' },
        { status: 400 }
      );
    }

    if (!shipping?.method || shipping?.cost === undefined || !shipping?.estimatedDelivery) {
      return NextResponse.json(
        { error: 'Informations de livraison incomplètes' },
        { status: 400 }
      );
    }

    // Calculer les totaux
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number; }) => sum + (item.price * item.quantity), 0);
    const shippingCost = shipping.cost || 0;
    const discount = payment?.discount || 0;
    const total = subtotal + shippingCost - discount;

    const order = new Order({
      items,
      customer,
      shipping,
      payment: {
        subtotal,
        shipping: shippingCost,
        discount,
        total,
        method: payment?.method || 'card',
        status: payment?.status || 'pending'
      },
      trackingCode: generateTrackingCode(),
      deliveryStatus: 'processing',
      statusUpdatedAt: new Date(),
      trackingHistory: [{
        status: 'processing',
        date: new Date(),
        notes: 'Commande reçue'
      }]
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Commande créée avec succès',
      orderId: order._id,
      trackingCode: order.trackingCode
    });

  } catch (error: any) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const trackingCode = searchParams.get('trackingCode');

    // Get single order by ID or tracking code
    if (id || trackingCode) {
      const query = id ? { _id: id } : { trackingCode };
      const order = await Order.findOne(query)
        .populate('items.productId', 'name price imageUrls');

      if (!order) {
        return createOrderResponse({ message: 'Order not found' }, 404);
      }

      return createOrderResponse({ data: order });
    }

    // Get all orders
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name price imageUrls');

    return createOrderResponse({
      data: orders,
      message: 'Orders retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return createOrderResponse({
      message: 'Error retrieving orders'
    }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { deliveryStatus } = body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedOrder },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error updating order' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return createOrderResponse({ message: 'Order ID is required' }, 400);
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return createOrderResponse({ message: 'Order not found' }, 404);
    }

    return createOrderResponse({
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return createOrderResponse({
      message: 'Error deleting order'
    }, 500);
  }
}