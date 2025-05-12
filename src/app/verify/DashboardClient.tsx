'use client';
import { useState, useEffect } from 'react';
import { HiHomeModern, HiShoppingBag, HiUsers,  HiDocumentText, HiPhone, HiCurrencyDollar } from "react-icons/hi2";
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardHeader from "../dashboard/components/DashboardHeader";
import { BiCollection } from 'react-icons/bi';
import { EyeIcon } from 'lucide-react';

// Types based on your APIs
interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
  category: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
  category: string;
}

interface Collection {
  _id: string;
  name: string;
  status: string;
}

interface Order {
  _id: string;
  trackingCode: string;
  deliveryStatus: string;
  payment: {
    total: number;
  };
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

// Sample data for when API fails
const sampleData = {
  products: [
    { _id: '1', name: 'Product 1', price: 99.99, stock: 10, sold: 5, category: 'Category A' },
    { _id: '2', name: 'Product 2', price: 149.99, stock: 3, sold: 12, category: 'Category B' },
    { _id: '3', name: 'Product 3', price: 79.99, stock: 8, sold: 7, category: 'Category A' },
    { _id: '4', name: 'Product 4', price: 199.99, stock: 2, sold: 15, category: 'Category C' },
    { _id: '5', name: 'Product 5', price: 59.99, stock: 20, sold: 3, category: 'Category B' },
  ],
  orders: [
    { 
      _id: '1', 
      trackingCode: 'CMD123456', 
      deliveryStatus: 'processing', 
      payment: { total: 99.99 }, 
      createdAt: new Date().toISOString() 
    },
    { 
      _id: '2', 
      trackingCode: 'CMD234567', 
      deliveryStatus: 'shipped', 
      payment: { total: 149.99 }, 
      createdAt: new Date(Date.now() - 86400000).toISOString() 
    },
    { 
      _id: '3', 
      trackingCode: 'CMD345678', 
      deliveryStatus: 'delivered', 
      payment: { total: 79.99 }, 
      createdAt: new Date(Date.now() - 172800000).toISOString() 
    },
    { 
      _id: '4', 
      trackingCode: 'CMD456789', 
      deliveryStatus: 'in_transit', 
      payment: { total: 199.99 }, 
      createdAt: new Date(Date.now() - 259200000).toISOString() 
    },
    { 
      _id: '5', 
      trackingCode: 'CMD567890', 
      deliveryStatus: 'delivered', 
      payment: { total: 59.99 }, 
      createdAt: new Date(Date.now() - 345600000).toISOString() 
    },
  ],
  blogPosts: [
    { _id: '1', title: 'Blog Post 1', slug: 'blog-post-1', createdAt: new Date().toISOString(), category: 'News' },
    { _id: '2', title: 'Blog Post 2', slug: 'blog-post-2', createdAt: new Date(Date.now() - 86400000).toISOString(), category: 'Tutorial' },
    { _id: '3', title: 'Blog Post 3', slug: 'blog-post-3', createdAt: new Date(Date.now() - 172800000).toISOString(), category: 'Product' },
    { _id: '4', title: 'Blog Post 4', slug: 'blog-post-4', createdAt: new Date(Date.now() - 259200000).toISOString(), category: 'News' },
    { _id: '5', title: 'Blog Post 5', slug: 'blog-post-5', createdAt: new Date(Date.now() - 345600000).toISOString(), category: 'Tutorial' },
  ]
};

// Stats Card Component
const StatsCard = ({ title, value, icon, bgColor }: { title: string; value: number | string; icon: React.ReactNode; bgColor: string }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`${bgColor} rounded-full p-3 mr-4`}>
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

// Table Component
const DataTable = ({ title, headers, data, onRowClick }: { 
  title: string; 
  headers: string[]; 
  data: any[]; 
  onRowClick?: (item: any) => void 
}) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr 
                key={index} 
                className={onRowClick ? "hover:bg-gray-100 cursor-pointer" : ""}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {Object.values(item).map((value: any, valueIndex) => (
                  <td key={valueIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {value}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-gray-500">
                Aucune donnée disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Safe Fetch Helper
const safeFetch = async (url: string, defaultValue: any = []) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Error fetching ${url}:`, error);
    return defaultValue;
  }
};

// Main Dashboard Component
export default function DashboardClient({ user }: { user: any }) {
  // State for each data type
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrors([]);
        const newErrors: string[] = [];
        
        // Fetch blog posts
        try {
          const blogData = await safeFetch('/api/blog');
          if (blogData && blogData.posts) {
            setBlogPosts(blogData.posts);
          } else if (blogData && Array.isArray(blogData)) {
            setBlogPosts(blogData);
          } else {
            setBlogPosts(sampleData.blogPosts);
            newErrors.push("Erreur lors du chargement des articles de blog");
          }
        } catch (error) {
          console.error("Blog fetch error:", error);
          setBlogPosts(sampleData.blogPosts);
          newErrors.push("Erreur lors du chargement des articles de blog");
        }
        
        // Fetch products
        try {
          const productsData = await safeFetch('/api/products');
          if (productsData && productsData.data) {
            setProducts(productsData.data);
          } else if (productsData && productsData.success && productsData.data) {
            setProducts(productsData.data);
          } else {
            setProducts(sampleData.products);
            newErrors.push("Erreur lors du chargement des produits");
          }
        } catch (error) {
          console.error("Products fetch error:", error);
          setProducts(sampleData.products);
          newErrors.push("Erreur lors du chargement des produits");
        }
        
        // Try alternate API paths
        const apiPaths = {
          collections: ['/api/collection', '/api/collection'],
          orders: ['/api/orders', '/api/orders'],
          contacts: ['/api/contact', '/api/contact']
        };
        
        // Try collections APIs
        let collectionsLoaded = false;
        for (const path of apiPaths.collections) {
          try {
            const collectionsData = await safeFetch(path);
            if (collectionsData && (collectionsData.data || Array.isArray(collectionsData))) {
              setCollections(collectionsData.data || collectionsData);
              collectionsLoaded = true;
              break;
            }
          } catch (error) {
            console.warn(`Failed to fetch from ${path}`);
          }
        }
        if (!collectionsLoaded) {
          setCollections([]);
          newErrors.push("Erreur lors du chargement des collections");
        }
        
        // Try orders APIs
        let ordersLoaded = false;
        for (const path of apiPaths.orders) {
          try {
            const ordersData = await safeFetch(path);
            if (ordersData && (ordersData.data || Array.isArray(ordersData))) {
              setOrders(ordersData.data || ordersData);
              ordersLoaded = true;
              break;
            }
          } catch (error) {
            console.warn(`Failed to fetch from ${path}`);
          }
        }
        if (!ordersLoaded) {
          setOrders(sampleData.orders);
          newErrors.push("Erreur lors du chargement des commandes");
        }
        
        // Try contacts APIs
        let contactsLoaded = false;
        for (const path of apiPaths.contacts) {
          try {
            const contactsData = await safeFetch(path);
            if (contactsData) {
              setContacts(Array.isArray(contactsData) ? contactsData : contactsData.data || []);
              contactsLoaded = true;
              break;
            }
          } catch (error) {
            console.warn(`Failed to fetch from ${path}`);
          }
        }
        if (!contactsLoaded) {
          setContacts([]);
          newErrors.push("Erreur lors du chargement des contacts");
        }
        
        if (newErrors.length > 0) {
          setErrors(newErrors);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Use sample data as fallback
        setBlogPosts(sampleData.blogPosts);
        setProducts(sampleData.products);
        setOrders(sampleData.orders);
        setErrors(["Erreur de chargement des données du tableau de bord"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate summary statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.payment?.total || 0), 0);
  const lowStockProducts = products.filter(p => p.stock < 5).length;
  
  // Orders by status for pie chart
  const orderStatusData = [
    { name: 'Processing', value: orders.filter(o => o.deliveryStatus === 'processing').length },
    { name: 'Shipped', value: orders.filter(o => o.deliveryStatus === 'shipped').length },
    { name: 'In Transit', value: orders.filter(o => o.deliveryStatus === 'in_transit').length },
    { name: 'Out for Delivery', value: orders.filter(o => o.deliveryStatus === 'out_for_delivery').length },
    { name: 'Delivered', value: orders.filter(o => o.deliveryStatus === 'delivered').length },
    { name: 'Cancelled', value: orders.filter(o => o.deliveryStatus === 'cancelled').length },
  ].filter(item => item.value > 0);
  
  // Product sales data for bar chart
  const topSellingProducts = [...products]
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5)
    .map(p => ({ name: p.name, sold: p.sold || 0 }));
  
  // Monthly revenue data for line chart (simulated based on orders)
  const currentDate = new Date();
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentDate.getMonth() - i + 12) % 12;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[monthIndex];
    
    // Filter orders for this month (simplified logic)
    const monthRevenue = orders
      .filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === monthIndex;
      })
      .reduce((sum, order) => sum + (order.payment?.total || 0), 0);
    
    return { name: monthName, revenue: monthRevenue };
  }).reverse();

  // Prepare recent orders data for table
  const recentOrdersData = orders
    .slice(0, 5)
    .map(order => ({
      id: order.trackingCode || order._id,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      status: order.deliveryStatus || 'Unknown',
      amount: `${order.payment?.total?.toFixed(2) || 0} €`
    }));

  // Color scheme for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF5733'];

  return (
    <>
      <DashboardHeader user={user} />
      
      <main className="p-6 md:p-10 mt-16 bg-gray-100 min-h-screen">
        <div>
          <span className="flex items-center mb-6">
            <span className="shrink-0 pe-4 text-gray-900">
              Bienvenue dans le Dashboard Admin 👑 Connecté en tant que: {user?.given_name || user?.name || 'Admin'}
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></span>
           
            <a
              className="inline-block rounded-sm border border-amber-600 px-4 md:px-12 py-2 md:py-3 text-sm font-medium text-amber-600 hover:bg-amber-600 hover:text-white focus:outline-hidden"
              href="/"
            >
              <EyeIcon className="inline-block h-5 w-5 mr-1 text-amber-600 hover:text-white" aria-hidden="true" />
              Voir La boutique
            </a>
          </span>
        </div>

        {/* Error messages if any */}
        {errors.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Certaines données n'ont pas pu être chargées. Affichage des données de démonstration.
                </p>
                <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard 
                title="Total des produits" 
                value={totalProducts}

                icon={<HiShoppingBag className="h-6 w-6 text-white" />} 
                bgColor="bg-blue-500" 
              />
              <StatsCard 
                title="Total des commandes" 
                value={totalOrders} 
                icon={<BiCollection className="h-6 w-6 text-white" />} 
                bgColor="bg-green-500" 
              />
              <StatsCard 
                title="Chiffre d'affaires" 
                value={`${totalRevenue.toFixed(2)} DZA`} 
                icon={<HiCurrencyDollar className="h-6 w-6 text-white" />} 
                bgColor="bg-purple-500" 
              />
              <StatsCard 
                title="Stock faible" 
                value={lowStockProducts} 
                icon={<HiShoppingBag className="h-6 w-6 text-white" />} 
                bgColor="bg-red-500" 
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Revenue Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Chiffre d'affaires mensuel</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} €`, 'Revenu']} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Statut des commandes</h3>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData.length > 0 ? orderStatusData : [{ name: 'No Data', value: 1 }]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {(orderStatusData.length > 0 ? orderStatusData : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} commandes`, props.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Selling Products */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Produits les plus vendus</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSellingProducts.length > 0 ? topSellingProducts : [{ name: 'No Data', sold: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sold" fill="#82ca9d" name="Unités vendues" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders Table */}
              <DataTable
                title="Commandes récentes"
                headers={["ID", "Date", "Statut", "Montant"]}
                data={recentOrdersData}
              />
            </div>

            {/* Product and Blog Post Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Products */}
              <DataTable
                title="Derniers produits ajoutés"
                headers={["Nom", "Prix", "Stock", "Catégorie"]}
                data={products.slice(0, 5).map(p => ({
                  name: p.name,
                  price: `${p.price?.toFixed(2) || 0} €`,
                  stock: p.stock || 0,
                  category: p.category || 'Non catégorisé'
                }))}
              />

              {/* Recent Blog Posts */}
              <DataTable
                title="Derniers articles du blog"
                headers={["Titre", "Catégorie", "Date"]}
                data={blogPosts.slice(0, 5).map(post => ({
                  title: post.title,
                  category: post.category || 'Non catégorisé',
                  date: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'
                }))}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}