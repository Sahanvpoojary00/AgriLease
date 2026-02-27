'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { ListingCard } from '@/components/listings/ListingCard';
import { motion, AnimatePresence } from 'framer-motion';
import type { Listing, Application, Contract, UserRole, Product, Order } from '@/lib/types';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Data states
    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [ordersReceived, setOrdersReceived] = useState<Order[]>([]);
    const [myOrders, setMyOrders] = useState<Order[]>([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showListingModal, setShowListingModal] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [appsReceivedCount, setAppsReceivedCount] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrdersListModal, setShowOrdersListModal] = useState(false);

    // New Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '', // Keep as string for form input
        category: 'Seeds' as Product['category'], // Explicitly type category
        description: '',
        stock_quantity: '', // Keep as string for form input
        image_url: '' // Add image_url to fix TS error
    });

    const [productImage, setProductImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Listing Form State (for editing)
    const [listingForm, setListingForm] = useState({
        title: '',
        description: '',
        area_size: '',
        price_expected: '',
        status: 'active' as Listing['status']
    });

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);

        const { data: profileData } = await insforge.database
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const currentUserRole = (profileData as any)?.role as UserRole | undefined;
        setProfile(profileData);

        if (currentUserRole === 'landowner') {
            const { data: listData } = await insforge.database
                .from('listings')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });
            setListings((listData as Listing[]) || []);
        } else if (currentUserRole === 'farmer') {
            const { data: appData } = await insforge.database
                .from('applications')
                .select('*, listings(*)')
                .eq('farmer_id', user.id)
                .order('created_at', { ascending: false });
            setApplications((appData as Application[]) || []);

            // Fetch Farmer Orders
            const { data: orderData } = await insforge.database
                .from('orders')
                .select('*, product:products(*), vendor:profiles(*)')
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });
            setMyOrders((orderData as any[]) || []);
        } else if (currentUserRole === 'vendor') {
            // Fetch Vendor Products
            const { data: prodData } = await insforge.database
                .from('products')
                .select('*')
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });
            setMyProducts((prodData as Product[]) || []);

            // Fetch Orders Received
            const { data: receivedData } = await insforge.database
                .from('orders')
                .select('*, product:products(*), buyer:profiles(*)')
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });
            setOrdersReceived((receivedData as any[]) || []);
        }

        if (currentUserRole === 'landowner') {
            // Count applications for landowner's listings
            const { count } = await insforge.database
                .from('applications')
                .select('*, listings!inner(*)', { count: 'exact', head: true })
                .eq('listings.owner_id', user.id);
            setAppsReceivedCount(count || 0);
        }

        // Shared data (contracts) for farmers/landowners
        if (currentUserRole !== 'vendor') {
            const { data: contractData } = await insforge.database
                .from('contracts')
                .select('*, listings(*)')
                .or(`farmer_id.eq.${user.id},landowner_id.eq.${user.id}`)
                .order('created_at', { ascending: false });
            setContracts((contractData as Contract[]) || []);
        }

        setLoading(false);
    }, [user?.id]);
    useEffect(() => {
        if (!user) return;
        fetchData();

        // Realtime Subscription
        const setupRealtime = async () => {
            await insforge.realtime.connect();
            await insforge.realtime.subscribe('orders');
            await insforge.realtime.subscribe('applications');
            await insforge.realtime.subscribe('contracts');
            await insforge.realtime.subscribe('listings');
            await insforge.realtime.subscribe('products');

            // Robust Event Handler checking the user context
            const handleOrderEvent = (payload: any) => {
                const record = payload.new || payload.old || payload;
                if (record.vendor_id === user.id || record.buyer_id === user.id) {
                    fetchData();
                }
            };

            const handleApplicationEvent = (payload: any) => {
                const record = payload.new || payload.old || payload;
                if (record.applicant_id === user.id || record.owner_id === user.id) {
                    fetchData();
                } else {
                    fetchData(); // Fallback for landowners without full record
                }
            };

            const handleGeneralEvent = () => fetchData();

            // Orders
            insforge.realtime.on('INSERT_order', handleOrderEvent);
            insforge.realtime.on('UPDATE_order', handleOrderEvent);
            insforge.realtime.on('DELETE_order', handleOrderEvent);

            // Applications
            insforge.realtime.on('INSERT_application', handleApplicationEvent);
            insforge.realtime.on('UPDATE_application', handleApplicationEvent);
            insforge.realtime.on('DELETE_application', handleApplicationEvent);

            // Contracts
            insforge.realtime.on('INSERT_contract', handleGeneralEvent);
            insforge.realtime.on('UPDATE_contract', handleGeneralEvent);
            insforge.realtime.on('DELETE_contract', handleGeneralEvent);

            // Listings
            insforge.realtime.on('INSERT_listing', handleGeneralEvent);
            insforge.realtime.on('UPDATE_listing', handleGeneralEvent);
            insforge.realtime.on('DELETE_listing', handleGeneralEvent);

            // Products
            insforge.realtime.on('INSERT_product', handleGeneralEvent);
            insforge.realtime.on('UPDATE_product', handleGeneralEvent);
            insforge.realtime.on('DELETE_product', handleGeneralEvent);
        };

        setupRealtime();

        return () => {
            insforge.realtime.unsubscribe('orders');
            insforge.realtime.unsubscribe('applications');
            insforge.realtime.unsubscribe('contracts');
            insforge.realtime.unsubscribe('listings');
            insforge.realtime.unsubscribe('products');
        };
    }, [user, fetchData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async () => {
        if (!user) return;
        setUploading(true);
        try {
            let finalImageUrl = '';

            // 1. Upload image if selected
            if (productImage) {
                const { data, error: uploadError } = await insforge.storage
                    .from('products')
                    .uploadAuto(productImage);

                if (uploadError) {
                    alert(`Upload failed: ${uploadError.message}`);
                    setUploading(false);
                    return;
                }
                finalImageUrl = data?.url || '';
            }

            // 2. Insert/Update product
            const productData = {
                vendor_id: user.id,
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                category: newProduct.category as Product['category'],
                description: newProduct.description,
                stock_quantity: parseInt(newProduct.stock_quantity),
                image_url: finalImageUrl || (editingProduct ? editingProduct.image_url : ''),
                pin_code: profile?.pin_code
            };

            if (editingProduct) {
                const { error } = await insforge.database
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                const { error } = await insforge.database
                    .from('products')
                    .insert([productData]);
                if (error) throw error;
            }

            setShowAddProduct(false);
            setEditingProduct(null);
            setNewProduct({ name: '', price: '', category: 'Seeds', description: '', stock_quantity: '10', image_url: '' });
            setProductImage(null);
            setImagePreview(null);
            fetchData();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const { error } = await insforge.database
            .from('products')
            .delete()
            .eq('id', id);
        if (!error) fetchData();
        else alert(`Delete failed: ${error.message}`);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            price: product.price.toString(),
            category: product.category,
            description: product.description || '',
            stock_quantity: product.stock_quantity.toString(),
            image_url: product.image_url || ''
        });
        setImagePreview(product.image_url);
        setShowAddProduct(true);
    };

    const handleEditListing = (listing: Listing) => {
        setEditingListing(listing);
        setListingForm({
            title: listing.title,
            description: listing.description || '',
            area_size: listing.area_size.toString(),
            price_expected: listing.price_expected?.toString() || '',
            status: listing.status
        });
        setShowListingModal(true);
    };

    const handleUpdateListing = async () => {
        if (!editingListing) return;
        setUploading(true);
        try {
            const { error } = await insforge.database
                .from('listings')
                .update({
                    title: listingForm.title,
                    description: listingForm.description,
                    area_size: parseFloat(listingForm.area_size),
                    price_expected: parseFloat(listingForm.price_expected),
                    status: listingForm.status
                })
                .eq('id', editingListing.id);

            if (!error) {
                setShowListingModal(false);
                setEditingListing(null);
                fetchData();
            } else {
                alert(`Update failed: ${error.message}`);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!confirm('Are you sure you want to delete this land listing? This cannot be undone.')) return;
        const { error } = await insforge.database
            .from('listings')
            .delete()
            .eq('id', id);
        if (!error) fetchData();
        else alert(`Delete failed: ${error.message}`);
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        const { error } = await insforge.database
            .from('orders')
            .update({ status })
            .eq('id', orderId);
        if (!error) fetchData();
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-earth-deep flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const activeRole = profile?.role as UserRole | undefined;

    return (
        <div className="min-h-screen bg-earth-deep text-slate-200">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                {/* Dashboard Header */}
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
                        >
                            Central Command Center
                        </motion.p>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-600">
                                {profile?.full_name?.split(' ')[0] || 'User'}
                            </span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                {activeRole || 'Unassigned Role'}
                            </span>
                            {!activeRole && <Link href="/profile" className="text-emerald-500 text-xs font-bold hover:underline">Complete Profile →</Link>}
                        </div>
                    </div>

                    {activeRole === 'vendor' && (
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => setShowOrdersListModal(true)}
                                variant="outline"
                                className="h-16 px-6 rounded-2xl border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-sm font-black uppercase tracking-widest relative"
                            >
                                <span className="text-xl mr-2">🔔</span> Orders
                                {ordersReceived.length > 0 && (
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-glow-emerald">
                                        {ordersReceived.length}
                                    </span>
                                )}
                            </Button>
                            <Button
                                onClick={() => setShowAddProduct(true)}
                                className="h-16 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-sm font-black uppercase tracking-widest shadow-glow-emerald/20"
                            >
                                + Add New Product
                            </Button>
                        </div>
                    )}
                </header>

                {/* Vendor Console */}
                {activeRole === 'vendor' && (
                    <div className="space-y-20">
                        {/* Vendor Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard label="Live Products" value={myProducts.length} icon="📦" />
                            <StatCard label="Orders Received" value={ordersReceived.length} icon="🔔" />
                            <StatCard label="Pending Delivery" value={ordersReceived.filter(o => o.status === 'Accepted').length} icon="🚚" />
                        </div>

                        {/* Recent Orders received */}
                        <section>
                            <h2 className="text-3xl font-black text-white tracking-tight mb-10 flex items-center gap-4">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                                Orders Received
                            </h2>
                            {ordersReceived.length === 0 ? (
                                <EmptyState msg="No orders yet. Your items are visible to all farmers." />
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {ordersReceived.map(order => (
                                        <Card key={order.id} className="p-8 rounded-[2.5rem] bg-earth-card border-earth-border hover:border-emerald-500/20 transition-all">
                                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                                <div className="flex gap-6">
                                                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                                                        {order.product?.image_url ? <img src={order.product.image_url} className="w-full h-full object-cover" /> : '🛒'}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="text-xl font-black text-white">{order.product?.name}</h4>
                                                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-emerald-400">Qty: {order.quantity}</span>
                                                        </div>
                                                        <p className="text-emerald-500/40 text-[10px] font-black uppercase">Total: ₹{order.total_price}</p>

                                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                            <div>
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Farmer</p>
                                                                <p className="text-sm font-bold text-white">{order.buyer?.full_name || 'Farmer'}</p>
                                                                <p className="text-xs text-slate-400 mt-1">📞 {order.phone_number}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Delivery Address</p>
                                                                <p className="text-xs text-slate-400 leading-relaxed">{order.delivery_address}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center lg:items-end justify-center gap-4">
                                                    <div className="text-center lg:text-right">
                                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Order Status</p>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                            className={`h-12 px-6 rounded-xl bg-black/40 border text-xs font-black uppercase tracking-widest focus:outline-none transition-all ${order.status === 'Delivered' ? 'text-emerald-400 border-emerald-500/30' :
                                                                order.status === 'Cancelled' ? 'text-red-400 border-red-500/30' :
                                                                    order.status === 'Accepted' ? 'text-blue-400 border-blue-500/30' :
                                                                        'text-amber-400 border-amber-500/30'
                                                                }`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Accepted">Accepted</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* My Products */}
                        <section>
                            <h2 className="text-3xl font-black text-white tracking-tight mb-10 flex items-center gap-4">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                                Inventory Management
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {myProducts.map(product => (
                                    <Card key={product.id} className="p-6 rounded-[2rem] bg-earth-card border-earth-border relative group h-full flex flex-col">
                                        <div className="mb-4 flex justify-between items-start">
                                            <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">{product.category}</span>
                                            <span className="text-white font-black">₹{product.price}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-white mb-2 truncate">{product.name}</h4>
                                        <p className="text-slate-500 text-xs line-clamp-2 mb-6">{product.description}</p>
                                        <div className="mt-auto pt-4 border-t border-earth-border flex justify-between items-center gap-4">
                                            <span className="text-slate-600 text-[10px] font-black uppercase">Stock: {product.stock_quantity}</span>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="text-emerald-500 hover:text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {myProducts.length === 0 && <div className="col-span-full py-20 bg-earth-card border-2 border-dashed border-earth-border rounded-[3rem] text-center text-slate-700 font-bold uppercase tracking-widest text-sm">No products listed. Add your first item.</div>}
                            </div>
                        </section>
                    </div>
                )}

                {/* Farmer / Landowner Dashboard */}
                {activeRole !== 'vendor' && (
                    <div className="space-y-20">
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {activeRole === 'farmer' ? (
                                <>
                                    <StatCard label="Orders" value={myOrders.length} icon="📦" />
                                    <StatCard label="Leases" value={contracts.length} icon="📜" />
                                    <StatCard label="Apps" value={applications.length} icon="📝" />
                                    <StatCard label="AI Scans" value={0} icon="🩺" />
                                </>
                            ) : (
                                <>
                                    <StatCard label="Listings" value={listings.length} icon="🏡" />
                                    <StatCard label="Apps Recv" value={appsReceivedCount} icon="📩" />
                                    <StatCard label="Contracts" value={contracts.length} icon="✍️" />
                                    <StatCard label="Revenue" value={0} icon="💰" />
                                </>
                            )}
                        </div>

                        {/* Marketplace Orders (For Farmers) */}
                        {activeRole === 'farmer' && (
                            <section>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-10 flex items-center gap-4">
                                    <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                                    Marketplace Orders
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myOrders.map(order => (
                                        <Card key={order.id} className="p-8 rounded-[2.5rem] bg-earth-card border-earth-border flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">📦</div>
                                                    <div>
                                                        <h4 className="text-white font-black tracking-tight">{order.product?.name}</h4>
                                                        <p className="text-emerald-500/50 text-[10px] font-black uppercase">By {order.vendor?.shop_name || order.vendor?.full_name}</p>
                                                        <p className="text-slate-400 text-[10px] mt-1">📞 {order.vendor?.phone}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                    }`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                                <span className="text-white font-black">₹{order.total_price}</span>
                                                <span className="text-slate-600 text-[10px] font-black tracking-widest uppercase">{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </Card>
                                    ))}
                                    {myOrders.length === 0 && <div className="col-span-full py-16 text-center text-slate-700 italic border-2 border-dashed border-white/5 rounded-[3rem]">No marketplace orders yet.</div>}
                                </div>
                            </section>
                        )}

                        {/* Common leasing sections (Existing functionality) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Applications/Listings */}
                            <section>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-10 flex items-center gap-4">
                                    <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                                    {activeRole === 'farmer' ? 'Lease Applications' : 'My Land Listings'}
                                </h2>
                                <div className="space-y-4">
                                    {activeRole === 'farmer' ?
                                        applications.map(app => (
                                            <Card key={app.id} className="p-6 rounded-[2rem] bg-white/[0.02] border-white/10 flex justify-between items-center">
                                                <div>
                                                    <p className="text-white font-black tracking-tight">{app.listings?.title}</p>
                                                    <p className="text-slate-500 text-xs font-bold leading-none mt-1">{app.listings?.district}, {app.listings?.state}</p>
                                                </div>
                                                <StatusBadge status={app.status} />
                                            </Card>
                                        )) :
                                        listings.map(l => (
                                            <Card key={l.id} className="p-6 rounded-[2rem] bg-earth-card border-earth-border flex justify-between items-center transition-all hover:border-emerald-500/20">
                                                <div>
                                                    <p className="text-white font-black tracking-tight">{l.title}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <StatusBadge status={l.status} />
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">₹{l.price_expected?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleEditListing(l)}
                                                        className="h-8 px-4 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteListing(l.id)}
                                                        className="h-8 px-4 rounded-lg bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </Card>
                                        ))
                                    }
                                </div>
                            </section>

                            {/* Contracts */}
                            <section>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-10 flex items-center gap-4">
                                    <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                                    Smart Contracts
                                </h2>
                                <div className="space-y-4">
                                    {contracts.map(c => (
                                        <Card key={c.id} className="p-6 rounded-[2rem] bg-white/[0.02] border-white/10 flex justify-between items-center">
                                            <p className="text-white font-black tracking-tight uppercase text-sm truncate">{c.listings?.title}</p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{c.lease_end}</span>
                                                <StatusBadge status={c.status} />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </main>

            {/* Add Product Modal (Pure CSS implementation for speed/simplicity) */}
            <AnimatePresence>
                {showAddProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowAddProduct(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0f0a] border border-emerald-500/20 rounded-[3rem] p-12 shadow-2xl"
                        >
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-10">
                                {editingProduct ? 'Edit' : 'Add'} <span className="text-emerald-500">{editingProduct ? 'Product' : 'New Product'}</span>
                            </h2>
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Product Name</label>
                                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white focus:border-emerald-500 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Price (₹)</label>
                                    <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Quantity</label>
                                    <input type="number" value={newProduct.stock_quantity} onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Category</label>
                                    <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value as Product['category'] })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white uppercase text-xs font-black tracking-widest">
                                        <option value="Seeds">Seeds</option>
                                        <option value="Fertilizers">Fertilizers</option>
                                        <option value="Pesticides">Pesticides</option>
                                        <option value="Tools">Tools</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Product Image</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                            {imagePreview ? (
                                                <img src={imagePreview} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl opacity-20">📸</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="product-image-upload"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                            <label
                                                htmlFor="product-image-upload"
                                                className="h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
                                            >
                                                {productImage ? 'Change Image' : 'Select Image'}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Description</label>
                                    <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full p-6 bg-white/5 border border-white/10 rounded-xl text-white resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button fullWidth variant="outline" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }} className="rounded-2xl border-white/10 text-white font-black uppercase tracking-widest">Cancel</Button>
                                <Button fullWidth onClick={handleAddProduct} loading={uploading} className="rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest border-none">
                                    {editingProduct ? 'Update Product' : 'Publish Product'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Listing Modal */}
            <AnimatePresence>
                {showListingModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowListingModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0f0a] border border-emerald-500/20 rounded-[3rem] p-12 shadow-2xl"
                        >
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-10">Edit <span className="text-emerald-500">Land Listing</span></h2>
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Title</label>
                                    <input type="text" value={listingForm.title} onChange={e => setListingForm({ ...listingForm, title: e.target.value })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white focus:border-emerald-500 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Area (Acres)</label>
                                    <input type="number" value={listingForm.area_size} onChange={e => setListingForm({ ...listingForm, area_size: e.target.value })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Expected Price (₹)</label>
                                    <input type="number" value={listingForm.price_expected} onChange={e => setListingForm({ ...listingForm, price_expected: e.target.value })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Listing Status</label>
                                    <select value={listingForm.status} onChange={e => setListingForm({ ...listingForm, status: e.target.value as any })} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-white uppercase text-xs font-black tracking-widest">
                                        <option value="active">Active</option>
                                        <option value="leased">Leased</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-3 block">Description</label>
                                    <textarea rows={4} value={listingForm.description} onChange={e => setListingForm({ ...listingForm, description: e.target.value })} className="w-full p-6 bg-white/5 border border-white/10 rounded-xl text-white resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button fullWidth variant="outline" onClick={() => setShowListingModal(false)} className="rounded-2xl border-white/10 text-white font-black uppercase tracking-widest">Cancel</Button>
                                <Button fullWidth onClick={handleUpdateListing} loading={uploading} className="rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest border-none">Update Listing</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0a0f0a] border border-emerald-500/20 rounded-[3rem] p-12 shadow-2xl"
                        >
                            <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-4">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                                Order Details
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                    <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                                        {selectedOrder.product?.image_url ? <img src={selectedOrder.product.image_url} className="w-full h-full object-cover" /> : '📦'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">{selectedOrder.product?.name}</h3>
                                        <p className="text-emerald-500/60 text-xs font-black uppercase tracking-widest mt-1">Qty: {selectedOrder.quantity} • Total: ₹{selectedOrder.total_price}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                        <h4 className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-4">Buyer Information</h4>
                                        <p className="text-sm font-bold text-white mb-2">{selectedOrder.buyer?.full_name || 'Farmer User'}</p>
                                        <p className="text-xs text-slate-400 mb-2">📞 {selectedOrder.phone_number}</p>
                                        {selectedOrder.buyer?.district && selectedOrder.buyer?.state && (
                                            <p className="text-xs text-slate-400 mt-2 p-2 bg-black/40 rounded-lg">📍 {selectedOrder.buyer.district}, {selectedOrder.buyer.state}</p>
                                        )}
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                        <h4 className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-4">Delivery Details</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedOrder.delivery_address}</p>
                                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Status</p>
                                            <p className={`text-xs font-black uppercase tracking-widest ${selectedOrder.status === 'Delivered' ? 'text-emerald-400' :
                                                selectedOrder.status === 'Cancelled' ? 'text-red-400' :
                                                    selectedOrder.status === 'Accepted' ? 'text-blue-400' :
                                                        'text-amber-400'
                                                }`}>{selectedOrder.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Orders List Modal (Header Notification) */}
            <AnimatePresence>
                {showOrdersListModal && (
                    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowOrdersListModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[80vh] flex flex-col bg-[#0a0f0a] border border-emerald-500/20 rounded-[3rem] p-8 shadow-2xl"
                        >
                            <button onClick={() => setShowOrdersListModal(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-10">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 flex items-center gap-4 shrink-0">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                                Notifications: Orders Received ({ordersReceived.length})
                            </h2>

                            <div className="overflow-y-auto pr-2 space-y-4 flex-grow custom-scrollbar">
                                {ordersReceived.length === 0 ? (
                                    <p className="text-center text-slate-500 py-10 font-bold tracking-widest uppercase text-sm">No orders received yet.</p>
                                ) : (
                                    ordersReceived.map(order => (
                                        <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                                                    {order.product?.image_url ? <img src={order.product.image_url} className="w-full h-full object-cover" /> : '📦'}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white">{order.product?.name}</h4>
                                                    <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mt-1">From: {order.buyer?.full_name || 'Farmer'} • Qty: {order.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-end">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                        order.status === 'Accepted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setShowOrdersListModal(false);
                                                        setSelectedOrder(order);
                                                    }}
                                                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div >
    );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
    return (
        <Card className="p-8 rounded-[2.5rem] bg-earth-card border-earth-border hover:border-emerald-500/20 transition-all flex items-center justify-between">
            <div>
                <p className="text-emerald-500/40 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
                <p className="text-4xl font-black text-white tracking-tighter leading-none">{value}</p>
            </div>
            <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all opacity-20">{icon}</div>
        </Card>
    );
}

function EmptyState({ msg }: { msg: string }) {
    return (
        <div className="py-24 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-slate-700 font-black uppercase tracking-[0.5em] text-xs px-4">{msg}</p>
        </div>
    );
}
