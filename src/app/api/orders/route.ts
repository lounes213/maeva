// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongo';
import Order from '@/app/models/Order';
import { Product } from '@/app/models/Product';

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
const generateTrackingCode = (): string => {
  const prefix = 'CMD';
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
};

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
// Update the POST endpoint in route.ts
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body: OrderRequest = await req.json();

    // Validate request
    const { isValid, error } = validateOrderRequest(body);
    if (!isValid) {
      return createOrderResponse({ message: error }, 400);
    }

    // Verify products exist (but don't check stock)
    const verifiedItems = [];
    let subtotal = 0;
    
    for (const item of body.items) {
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

    const total = subtotal - (body.couponDiscount || 0) + body.shipping.cost;

    // Create new order with unique tracking code
    const newOrder = await Order.create({
      items: verifiedItems,
      customer: body.customer,
      shipping: body.shipping,
      payment: {
        subtotal,
        discount: body.couponDiscount || 0,
        shipping: body.shipping.cost,
        total
      },
      trackingCode: generateTrackingCode(),
      deliveryStatus: 'processing'
    });

    return createOrderResponse({
      message: 'Order created successfully',
      data: newOrder
    }, 201);

  } catch (error) {
    console.error('Order creation error:', error);
    return createOrderResponse({
      message: error instanceof Error ? error.message : 'Error creating order'
    }, 500);
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
    
    // Get ID from query parameters
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

    console.log(`Updating order ${id} to status ${deliveryStatus}`);

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