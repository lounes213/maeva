import { Product } from "@/app/models/Product";
import Order from "@/app/models/Order";
import { Contact } from "lucide-react";
import Collection from "@/app/models/collection";
import contact from "@/app/models/contact";
import dbConnect from "@/lib/mongo";


export async function getCounts() {
  await dbConnect();
  
  const [
    productsCount,
    ordersCount,
    unreadContacts,
    totalSales
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    contact.countDocuments({ status: 'unread' }),
    Order.aggregate([
      { $group: { _id: null, total: { $sum: "$payment.total" } } }
    ])
  ]);
  
  return {
    products: productsCount,
    orders: ordersCount,
    unreadContacts,
    totalSales: totalSales[0]?.total || 0
  };
}

export async function getRecentActivities() {
  await dbConnect();
  
  const [orders, contacts, collections] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    contact.find().sort({ createdAt: -1 }).limit(5).lean(),
    Collection.find().sort({ createdAt: -1 }).limit(5).lean()
  ]);
  
  return [
    ...orders.map(order => ({
      _id: order._id,
      type: 'Order',
      details: `Order #${order.trackingCode}`,
      createdAt: order.createdAt,
      status: order.deliveryStatus
    })),
    ...contacts.map(contact => ({
      _id: contact._id,
      type: 'Contact',
      details: `Message from ${contact.name}`,
      createdAt: contact.createdAt,
      status: contact.status
    })),
    ...collections.map(collection => ({
      _id: collection._id,
      type: 'Collection',
      details: `Collection ${collection.name}`,
      createdAt: collection.createdAt,
      status: collection.status
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 10);
}

export async function getSalesData() {
  await dbConnect();
  
  const sales = await Order.aggregate([
    { 
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: "$payment.total" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);
  
  return sales.map(item => ({
    date: item._id,
    total: item.total,
    count: item.count
  }));
}

export async function getContacts() {
  await dbConnect();
  return contact.find().sort({ createdAt: -1 }).limit(10).lean();
}

export async function getOrdersData() {
  await dbConnect();
  
  const statusCounts = await Order.aggregate([
    { 
      $group: {
        _id: "$deliveryStatus",
        count: { $sum: 1 }
      }
    }
  ]);
  
  return statusCounts.map(item => ({
    name: item._id,
    value: item.count
  }));
}