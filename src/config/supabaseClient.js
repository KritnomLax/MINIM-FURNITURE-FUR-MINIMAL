import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const supabaseUrl = (env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

const DEMO_PRODUCTS = [
  { id: 1, name: 'Minimalist Oak Dining Table', category: 'Living Room', price: 450, width: 14, depth: 8, image_url: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80', description: 'Solid oak dining table for modern family living.' },
  { id: 2, name: 'Scandinavian Coffee Table', category: 'Living Room', price: 180, width: 9, depth: 6, image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80', description: 'Clean-lined coffee table with soft organic curves.' },
  { id: 3, name: 'Ergonomic Wooden Work Desk', category: 'Office', price: 320, width: 12, depth: 7, image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80', description: 'Compact desk crafted for focused work and modern interiors.' },
  { id: 4, name: 'Walnut Bedside Nightstand', category: 'Bedroom', price: 120, width: 5, depth: 4, image_url: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80', description: 'Warm walnut nightstand for calming bedroom storage.' },
  { id: 5, name: 'Compact Study Desk', category: 'Office', price: 210, width: 10, depth: 5, image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', description: 'Minimal desk ideal for compact work-from-home spaces.' },
];

const DEMO_REVIEWS = [
  { id: 1, product_id: 1, user_id: 'demo-user-1', user_email: 'demo.customer@example.com', rating: 5, comment: 'วัสดุไม้โอ๊คสวยงามมาก ประกอบง่าย วางในห้องแล้วมินิมอลสมชื่อ!', photo_url: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 2, product_id: 1, user_id: 'demo-user-2', user_email: 'sarah.design@example.com', rating: 4, comment: 'ขนาดกำลังดี แข็งแรงทนทาน การจัดส่งแพ็คมาเรียบร้อยดีมากครับ', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const readStorage = (key, fallback) => {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn('Storage write failed in demo mode:', error);
  }
};

const createDemoQuery = (tableName) => {
  const state = {
    filters: [],
    orderBy: null,
    singleResult: false,
    limitValue: null,
  };

  const getTable = () => {
    switch (tableName) {
      case 'products':
        return readStorage('minim_demo_products', DEMO_PRODUCTS);
      case 'reviews':
        return readStorage('minim_demo_reviews', DEMO_REVIEWS);
      case 'saved_designs':
        return readStorage('minim_demo_saved_designs', []);
      case 'orders':
        return readStorage('minim_demo_orders', []);
      case 'order_items':
        return readStorage('minim_demo_order_items', []);
      default:
        return [];
    }
  };

  const applyFilters = (rows) => {
    let data = [...rows];

    for (const filter of state.filters) {
      const [type, field, value] = filter;
      if (type === 'eq') {
        data = data.filter(item => item[field] === value);
      }
    }

    if (state.orderBy) {
      const { field, ascending } = state.orderBy;
      data = [...data].sort((a, b) => {
        const left = a[field] ?? 0;
        const right = b[field] ?? 0;
        if (left < right) return ascending ? -1 : 1;
        if (left > right) return ascending ? 1 : -1;
        return 0;
      });
    }

    if (state.limitValue !== null) {
      data = data.slice(0, Number(state.limitValue));
    }

    return data;
  };

  const execute = async () => {
    const rows = applyFilters(getTable());
    return { data: state.singleResult ? (rows[0] ?? null) : rows, error: null };
  };

  const builder = {
    select: () => builder,
    eq: (field, value) => {
      state.filters.push(['eq', field, value]);
      return builder;
    },
    order: (field, options = {}) => {
      state.orderBy = { field, ascending: options.ascending ?? true };
      return builder;
    },
    limit: (value) => {
      state.limitValue = value;
      return builder;
    },
    single: () => {
      state.singleResult = true;
      return builder;
    },
    insert: async (rows) => {
      const tableData = getTable();
      const nextRows = rows.map((row, index) => {
        const idValue = row.id ?? Date.now() + index;
        return { ...row, id: idValue };
      });
      const merged = [...tableData, ...nextRows];
      writeStorage(`minim_demo_${tableName}`, merged);
      return { data: state.singleResult ? nextRows[0] ?? null : nextRows, error: null };
    },
    update: async (rows) => {
      const tableData = getTable();
      const nextRows = tableData.map(item => {
        const match = rows.find(row => row.id === item.id);
        return match ? { ...item, ...match } : item;
      });
      writeStorage(`minim_demo_${tableName}`, nextRows);
      return { data: state.singleResult ? nextRows[0] ?? null : nextRows, error: null };
    },
    delete: async () => {
      const tableData = getTable();
      const filtered = tableData.filter(item => !state.filters.some(([type, field, value]) => type === 'eq' && item[field] === value));
      writeStorage(`minim_demo_${tableName}`, filtered);
      return { data: filtered, error: null };
    },
    then: (resolve, reject) => execute().then(resolve).catch(reject),
    catch: (onRejected) => execute().catch(onRejected),
    finally: (onFinally) => execute().finally(onFinally),
  };

  return builder;
};

const createDemoAuth = () => ({
  getSession: async () => {
    const session = readStorage('minim_demo_session', null);
    return {
      data: { session: session ? { user: session.user, access_token: 'demo-token' } : null },
      error: null,
    };
  },
  onAuthStateChange: (callback) => {
    const session = readStorage('minim_demo_session', null);
    callback('INITIAL_SESSION', session ? { user: session.user } : null);
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
  signInWithPassword: async ({ email, password }) => {
    const role = /admin/i.test(email || '') ? 'admin' : 'user';
    const session = {
      user: {
        id: 'demo-user-id',
        email,
        app_metadata: { role },
        user_metadata: {},
      },
      access_token: `demo-${Date.now()}`,
      refresh_token: `demo-${Date.now()}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    writeStorage('minim_demo_session', session);
    return { data: { user: session.user, session }, error: null };
  },
  signUp: async ({ email, password }) => {
    return createDemoAuth().signInWithPassword({ email, password });
  },
  signOut: async () => {
    writeStorage('minim_demo_session', null);
    return { error: null };
  },
  refreshSession: async () => {
    const session = readStorage('minim_demo_session', null);
    return { data: { session: session ? { ...session, access_token: session.access_token || 'demo-token' } : null }, error: null };
  },
});

const createDemoStorage = () => ({
  from: (bucketName) => ({
    upload: async (path, file) => {
      const url = typeof URL !== 'undefined' && file?.name ? URL.createObjectURL(file) : `https://example.com/${path}`;
      const stored = readStorage('minim_demo_storage', {});
      stored[path] = { url, fileName: file?.name ?? path };
      writeStorage('minim_demo_storage', stored);
      return { data: { path }, error: null };
    },
    getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } }),
  }),
});

const createDemoRpc = () => ({
  place_order: async (payload) => {
    const orderItems = payload?.p_items ?? [];
    const total = orderItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
    const orders = readStorage('minim_demo_orders', []);
    const newOrder = {
      id: Date.now(),
      user_id: 'demo-user-id',
      total_price: total,
      status: 'paid',
      created_at: new Date().toISOString(),
      shipping_name: payload?.p_shipping_name ?? 'Demo Customer',
      shipping_address: payload?.p_shipping_address ?? 'Demo Address',
      shipping_phone: payload?.p_shipping_phone ?? '081-234-5678',
    };
    orders.push(newOrder);
    writeStorage('minim_demo_orders', orders);
    return { data: { order: newOrder }, error: null };
  },
});

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      demoMode: true,
      from: createDemoQuery,
      auth: createDemoAuth(),
      storage: createDemoStorage(),
      rpc: async (name, params) => {
        if (name === 'place_order') {
          return createDemoRpc().place_order(params);
        }
        return { data: null, error: null };
      },
    };

console.log('Supabase mode:', isSupabaseConfigured ? 'configured' : 'demo');
