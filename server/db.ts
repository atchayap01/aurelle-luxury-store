import bcrypt from 'bcryptjs';
import { User, IUser, Address } from './models/User.js';
import { Product, IProduct } from './models/Product.js';
import { Order, IOrder, OrderItem } from './models/Order.js';
import { initialProducts } from './seedData.js';

export type { Address, OrderItem };

const clean = (doc: any) => {
  if (!doc) return null;

  const { _id, ...data } = doc;
  return data;
};

const cleanMany = (docs: any[]) => docs.map(clean);

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

const makeOrderNumber = () =>
  `AUR-${Math.floor(10000 + Math.random() * 90000)}`;

// --------------------------------------------------
// USERS
// --------------------------------------------------

const Users = {
  async find(filter?: (u: any) => boolean) {
    const users = await User.find().lean();
    const cleaned = cleanMany(users);

    return filter ? cleaned.filter(filter) : cleaned;
  },

  async findOne(filter: (u: any) => boolean) {
    const users = await User.find().lean();
    const user = cleanMany(users).find(filter);

    return user || null;
  },

  async findById(id: string) {
    const user = await User.findOne({ id }).lean();
    return clean(user);
  },

  async create(userData: any) {
    const user = await User.create({
      ...userData,
      id: userData.id || makeId('usr'),
      wishlist: Array.isArray(userData.wishlist)
        ? [...new Set(userData.wishlist.filter(Boolean))]
        : [],
      addresses: Array.isArray(userData.addresses)
        ? userData.addresses
        : []
    });

    return clean(user.toObject());
  },

  async findByIdAndUpdate(id: string, updates: Partial<IUser>) {
    const user = await User.findOneAndUpdate(
      { id },
      {
        ...updates,
        ...(updates.wishlist !== undefined && {
          wishlist: [...new Set(updates.wishlist.filter(Boolean))]
        })
      },
      { new: true, runValidators: true }
    ).lean();

    return clean(user);
  },

  async findByIdAndDelete(id: string) {
    const user = await User.findOneAndDelete({ id }).lean();
    return clean(user);
  },

  async countDocuments(filter?: (u: any) => boolean) {
    if (!filter) {
      return User.countDocuments();
    }

    const users = await User.find().lean();
    return cleanMany(users).filter(filter).length;
  },

  async getWishlist(userId: string) {
    const user = await User.findOne({ id: userId }).lean();

    return Array.isArray(user?.wishlist)
      ? [...user.wishlist]
      : [];
  },

  async addToWishlist(userId: string, productId: string) {
    if (!productId || typeof productId !== 'string') {
      return {
        user: await Users.findById(userId),
        wishlist: await Users.getWishlist(userId),
        added: false
      };
    }

    const user = await User.findOne({ id: userId }).lean();

    if (!user) {
      return {
        user: null,
        wishlist: [],
        added: false
      };
    }

    const wishlist = Array.isArray(user.wishlist)
      ? [...user.wishlist]
      : [];

    const trimmedId = productId.trim();

    if (wishlist.includes(trimmedId)) {
      return {
        user: clean(user),
        wishlist,
        added: false
      };
    }

    wishlist.push(trimmedId);

    const updated = await User.findOneAndUpdate(
      { id: userId },
      { wishlist },
      { new: true }
    ).lean();

    return {
      user: clean(updated),
      wishlist,
      added: true
    };
  },

  async removeFromWishlist(userId: string, productId: string) {
    if (!productId || typeof productId !== 'string') {
      return {
        user: await Users.findById(userId),
        wishlist: await Users.getWishlist(userId),
        removed: false
      };
    }

    const user = await User.findOne({ id: userId }).lean();

    if (!user) {
      return {
        user: null,
        wishlist: [],
        removed: false
      };
    }

    const wishlist = Array.isArray(user.wishlist)
      ? user.wishlist
      : [];

    const trimmedId = productId.trim();
    const updatedWishlist = wishlist.filter(
      id => id !== trimmedId
    );

    const removed = updatedWishlist.length < wishlist.length;

    if (!removed) {
      return {
        user: clean(user),
        wishlist,
        removed: false
      };
    }

    const updated = await User.findOneAndUpdate(
      { id: userId },
      { wishlist: updatedWishlist },
      { new: true }
    ).lean();

    return {
      user: clean(updated),
      wishlist: updatedWishlist,
      removed: true
    };
  },

  async toggleWishlist(userId: string, productId: string) {
    const user = await User.findOne({ id: userId }).lean();

    if (!user) {
      return {
        user: null,
        wishlist: [],
        added: false
      };
    }

    const wishlist = Array.isArray(user.wishlist)
      ? [...user.wishlist]
      : [];

    const trimmedId = productId.trim();

    let added: boolean;

    if (wishlist.includes(trimmedId)) {
      const index = wishlist.indexOf(trimmedId);
      wishlist.splice(index, 1);
      added = false;
    } else {
      wishlist.push(trimmedId);
      added = true;
    }

    const updated = await User.findOneAndUpdate(
      { id: userId },
      { wishlist },
      { new: true }
    ).lean();

    return {
      user: clean(updated),
      wishlist,
      added
    };
  },

  async syncWishlist(userId: string, incomingProductIds: string[]) {
    if (!Array.isArray(incomingProductIds)) {
      return {
        user: await Users.findById(userId),
        wishlist: await Users.getWishlist(userId),
        addedCount: 0
      };
    }

    const user = await User.findOne({ id: userId }).lean();

    if (!user) {
      return {
        user: null,
        wishlist: [],
        addedCount: 0
      };
    }

    const wishlist = Array.isArray(user.wishlist)
      ? [...user.wishlist]
      : [];

    const existing = new Set(wishlist);
    let addedCount = 0;

    for (const id of incomingProductIds) {
      if (typeof id !== 'string') continue;

      const trimmedId = id.trim();

      if (trimmedId && !existing.has(trimmedId)) {
        existing.add(trimmedId);
        wishlist.push(trimmedId);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await User.findOneAndUpdate(
        { id: userId },
        { wishlist },
        { new: true }
      );
    }

    const updatedUser = await User.findOne({ id: userId }).lean();

    return {
      user: clean(updatedUser),
      wishlist,
      addedCount
    };
  }
};

// --------------------------------------------------
// PRODUCTS
// --------------------------------------------------

const Products = {
  async find(filter?: (p: any) => boolean) {
    const products = await Product.find().lean();
    const cleaned = cleanMany(products);

    return filter ? cleaned.filter(filter) : cleaned;
  },

  async findOne(filter: (p: any) => boolean) {
    const products = await Product.find().lean();
    const product = cleanMany(products).find(filter);

    return product || null;
  },

  async findById(id: string) {
    const product = await Product.findOne({ id }).lean();
    return clean(product);
  },

  async create(productData: any) {
    const product = await Product.create({
      ...productData,
      id: productData.id || makeId('prod')
    });

    return clean(product.toObject());
  },

  async findByIdAndUpdate(id: string, updates: any) {
    const product = await Product.findOneAndUpdate(
      { id },
      updates,
      {
        new: true,
        runValidators: true
      }
    ).lean();

    return clean(product);
  },

  async findByIdAndDelete(id: string) {
    const product = await Product.findOneAndDelete({ id }).lean();
    return clean(product);
  },

  async countDocuments(filter?: (p: any) => boolean) {
    if (!filter) {
      return Product.countDocuments();
    }

    const products = await Product.find().lean();
    return cleanMany(products).filter(filter).length;
  }
};

// --------------------------------------------------
// ORDERS
// --------------------------------------------------

const Orders = {
  async find() {
    const orders = await Order
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return cleanMany(orders);
  },

  async findOne(filter: (o: any) => boolean) {
    const orders = await Order.find().lean();
    const order = cleanMany(orders).find(filter);

    return order || null;
  },

  async findById(id: string) {
    const order = await Order.findOne({
      $or: [
        { id },
        { orderNumber: id }
      ]
    }).lean();

    return clean(order);
  },

  async create(orderData: any) {
    const order = await Order.create({
      ...orderData,
      id: orderData.id || makeId('ord'),
      orderNumber: orderData.orderNumber || makeOrderNumber()
    });

    return clean(order.toObject());
  },

  async findByIdAndUpdate(id: string, updates: any) {
    const order = await Order.findOneAndUpdate(
      {
        $or: [
          { id },
          { orderNumber: id }
        ]
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    ).lean();

    return clean(order);
  },

  async findByIdAndDelete(id: string) {
    const order = await Order.findOneAndDelete({
      $or: [
        { id },
        { orderNumber: id }
      ]
    }).lean();

    return clean(order);
  },

  async countDocuments() {
    return Order.countDocuments();
  }
};

// --------------------------------------------------
// STOCK
// --------------------------------------------------

const decreaseStock = async (
  productId: string,
  quantity: number
) => {
  const product = await Product.findOneAndUpdate(
    {
      id: productId,
      stock: { $gte: quantity }
    },
    {
      $inc: { stock: -quantity }
    },
    {
      new: true
    }
  ).lean();

  return !!product;
};

const restoreStock = async (
  productId: string,
  quantity: number
) => {
  const product = await Product.findOneAndUpdate(
    { id: productId },
    {
      $inc: { stock: quantity }
    },
    {
      new: true
    }
  ).lean();

  return !!product;
};

// --------------------------------------------------
// DATABASE INITIALIZATION
// --------------------------------------------------

export async function initializeDatabase() {
  const productCount = await Product.countDocuments();

  if (productCount === 0) {
    await Product.insertMany(initialProducts);

    console.log(
      `[Aurelle] Seeded ${initialProducts.length} products.`
    );
  }

  const adminEmail =
    process.env.ADMIN_EMAIL || 'admin@aurelle.com';

  const adminPassword =
    process.env.ADMIN_PASSWORD || 'AdminAurelle123!';

  const existingAdmin = await User.findOne({
    email: adminEmail.toLowerCase()
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    await User.create({
      id: 'usr-admin-01',
      name: 'Aurelle Curator',
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      phone: '+91 98765 43210',
      role: 'admin',
      addresses: [],
      wishlist: ['prod-001', 'prod-008']
    });

    console.log('[Aurelle] Admin account seeded.');
  }
}

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

export const db = {
  Users,
  Products,
  Orders,
  decreaseStock,
  restoreStock
};

export { User, Product, Order };