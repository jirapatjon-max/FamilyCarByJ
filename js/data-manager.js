/**
 * DataManager - Centralized data handling for the application
 * Simulates a backend using localStorage
 */

class DataManager {
    constructor() {
        this.STORAGE_KEYS = {
            USERS: 'familyCar_users',
            PRODUCTS: 'carData', // Keep existing key for compatibility
            CATEGORIES: 'familyCar_categories',
            CURRENT_USER: 'familyCar_currentUser',
            ORDERS: 'familyCar_orders'
        };
        this.init();
    }

    init() {
        // --- ส่วนที่แก้ไข: จัดการ Admin User ---
        let users = this.getUsers();
        
        const adminEmail = 'admin@familycar.com'; // อีเมลสำหรับ Admin
        const adminPassword = '1234';             // รหัสผ่านที่กำหนด

        // ข้อมูล Admin ที่ต้องการบังคับใช้
        const adminData = {
            id: 'admin_001',
            name: 'Admin Master',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            phone: '081-234-5678',
            joinedDate: new Date().toISOString()
        };

        const adminIndex = users.findIndex(u => u.email === adminEmail);

        if (adminIndex !== -1) {
            // กรณีมี user admin อยู่แล้ว -> อัปเดตรหัสผ่านเป็น 1234
            users[adminIndex] = { ...users[adminIndex], ...adminData };
            console.log('Admin updated: Password reset to 1234');
        } else {
            // กรณีไม่มี -> สร้างใหม่เลย
            users.push(adminData);
            console.log('Admin created with password 1234');
        }

        // บันทึกลง LocalStorage ทันที เพื่อให้พร้อม Login
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        // ----------------------------------------

        // Initialize Categories
        const categories = this.getCategories();
        if (categories.length === 0) {
            const defaultCategories = [
                { id: 'Ferrari', name: 'Ferrari' },
                { id: 'Nissan', name: 'Nissan' },
                { id: 'Toyota', name: 'Toyota' }
            ];
            localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
        }

        // Initialize Products
        const products = this.getProducts();
        if (Object.keys(products).length === 0) {
            const defaultProducts = {
                'ferrari_001': {
                    id: 'ferrari_001',
                    name: 'Ferrari 12 Cilindri',
                    price: 35000000,
                    category: 'Ferrari',
                    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=500',
                    description: 'The Ferrari 12Cilindri is the natural evolution of the company\'s uncompromising powertrain philosophy.',
                    status: 'available'
                },
                'ferrari_002': {
                    id: 'ferrari_002',
                    name: 'Ferrari 812 GTS',
                    price: 40000000,
                    category: 'Ferrari',
                    image: 'https://hips.hearstapps.com/hmg-prod/images/2021-ferrari-812-gts-101-1603134336.jpg',
                    description: 'The 812 GTS sees the return of the V12 spider to the Ferrari range.',
                    status: 'available'
                },
                'nissan_001': {
                    id: 'nissan_001',
                    name: 'Nissan GT-R R35',
                    price: 12500000,
                    category: 'Nissan',
                    image: 'https://www.topgear.com/sites/default/files/2022/06/1-Nissan-GT-R-2022-review.jpg',
                    description: 'The legendary Godzilla, the ultimate everyday supercar.',
                    status: 'available'
                },
                'nissan_002': {
                    id: 'nissan_002',
                    name: 'Nissan Silvia S15',
                    price: 2500000,
                    category: 'Nissan',
                    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Nissan_Silvia_S15.jpg',
                    description: 'The drift icon, deeply loved by enthusiasts.',
                    status: 'available'
                },
                'toyota_001': {
                    id: 'toyota_001',
                    name: 'Toyota Supra MK4',
                    price: 3500000,
                    category: 'Toyota',
                    image: 'https://image.made-in-china.com/202f0j100-1111/1-18-Scale-Toyota-Supra-Model-Car.jpg',
                    description: 'The legendary 2JZ engine machine.',
                    status: 'available'
                }
            };
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
        }
    }

    // ================= USER MANAGEMENT =================

    getUsers() {
        const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
        return data ? JSON.parse(data) : [];
    }

    saveUser(user) {
        const users = this.getUsers();
        // Check if email already exists
        if (users.some(u => u.email === user.email)) {
            throw new Error('Email already registered');
        }

        user.id = user.id || 'user_' + Date.now();
        user.role = user.role || 'user'; // Default role
        user.joinedDate = user.joinedDate || new Date().toISOString();

        users.push(user);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        return user;
    }

    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            // Remove password before saving to session
            const { password, ...safeUser } = user;
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
            return safeUser;
        }
        return null;
    }

    updateUser(updatedData) {
        const users = this.getUsers();
        const currentUser = this.getCurrentUser();

        if (!currentUser) throw new Error("No user logged in");

        const index = users.findIndex(u => u.email === currentUser.email);
        if (index !== -1) {
            // Update in users array
            users[index] = { ...users[index], ...updatedData };
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

            // Update current user session (careful not to expose password if it was somehow in updatedData, though we usually filter it out)
            const safeUser = { ...users[index] };
            delete safeUser.password;
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));

            return safeUser;
        }
        throw new Error("User not found");
    }

    updateUserByEmail(email, updatedData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
            return users[index];
        }
        throw new Error("User not found");
    }

    deleteUser(email) {
        let users = this.getUsers();
        // Prevent deleting the last admin or self if needed (optional logic)
        const initialLength = users.length;
        users = users.filter(u => u.email !== email);

        if (users.length < initialLength) {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    }

    getCurrentUser() {
        const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    }

    // ================= CATEGORY MANAGEMENT =================

    getCategories() {
        const data = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
        return data ? JSON.parse(data) : [];
    }

    saveCategory(category) {
        const categories = this.getCategories();
        if (category.id) {
            // Check if ID exists (edit)
            const index = categories.findIndex(c => c.id === category.id);
            if (index !== -1) {
                categories[index] = category;
            } else {
                // New with specific ID (rare but possible)
                categories.push(category);
            }
        } else {
            // New without ID (generate one?) - For now assume ID is passed or name is ID
            // In this simple app, we might use name as ID or just generate one
            category.id = 'cat_' + Date.now();
            categories.push(category);
        }
        localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        return category;
    }

    deleteCategory(id) {
        let categories = this.getCategories();
        const initialLength = categories.length;
        categories = categories.filter(c => c.id !== id);

        if (categories.length < initialLength) {
            localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
            return true;
        }
        return false;
    }

    // ================= PRODUCT MANAGEMENT =================
    // Compatible with existing admin.html logic expecting object keyed by ID

    getProducts() {
        const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
        return data ? JSON.parse(data) : {};
    }

    saveProduct(id, product) {
        const products = this.getProducts();
        products[id] = product;
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    deleteProduct(id) {
        const products = this.getProducts();
        if (products[id]) {
            delete products[id];
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            return true;
        }
        return false;
    }

    // ================= ORDER MANAGEMENT =================

    getOrders() {
        const data = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
        return data ? JSON.parse(data) : [];
    }

    saveOrder(order) {
        const orders = this.getOrders();
        order.id = order.id || 'order_' + Date.now();
        order.date = order.date || new Date().toISOString();
        order.status = order.status || 'pending'; // pending, paid, approved

        orders.push(order);
        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        return order;
    }

    updateOrder(id, updatedData) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updatedData };
            localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            return orders[index];
        }
        throw new Error("Order not found");
    }

    deleteOrder(id) {
        let orders = this.getOrders();
        const initialLength = orders.length;
        orders = orders.filter(o => o.id !== id);

        if (orders.length < initialLength) {
            localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
            return true;
        }
        return false;
    }
}

// Create global instance
window.dataManager = new DataManager();