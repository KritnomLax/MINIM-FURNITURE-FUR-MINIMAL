import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [designsLoading, setDesignsLoading] = useState(false);

  // ── Fetch saved designs from Supabase ────────────────────────
  const fetchDesigns = useCallback(async (userId) => {
    if (!userId) return;
    setDesignsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedDesigns(data ?? []);
    } catch (err) {
      console.error('Failed to load saved designs:', err);
    } finally {
      setDesignsLoading(false);
    }
  }, []);

  // ── ตรวจสอบว่า user คนปัจจุบันมี role = admin หรือไม่ ─────────
  const isAdmin = (u) => {
    if (!u) return false;
    const meta = u.app_metadata ?? {};
    return meta.role === 'admin';
  };

  // ── Auth state listener ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchDesigns(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // รีเฟรช session เพื่อให้ได้ app_metadata ล่าสุด (รองรับกรณีตั้ง admin หลัง login)
      if (session?.user) {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        setUser(refreshed?.user ?? session.user);
        fetchDesigns((refreshed?.user ?? session.user).id);
      } else {
        setUser(null);
        setSavedDesigns([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchDesigns]);

  // ── Auth methods ──────────────────────────────────────────────
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSavedDesigns([]);
  };

  // ── Saved Designs CRUD ────────────────────────────────────────
  const saveDesign = async (designConfig) => {
    if (!user) return false;

    const record = {
      user_id:        user.id,
      furniture_type: designConfig.furnitureType ?? 'table',
      color:          designConfig.color,
      color_name:     designConfig.colorName,
      width:          designConfig.width,
      depth:          designConfig.depth,
      height:         designConfig.height,
      product_id:     designConfig.productId ?? null,
    };

    const { data, error } = await supabase
      .from('saved_designs')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('saveDesign error:', error);
      return false;
    }

    // Prepend to local state (newest first)
    setSavedDesigns(prev => [data, ...prev]);
    return true;
  };

  const deleteDesign = async (designId) => {
    if (!user) return;

    // Optimistic update
    setSavedDesigns(prev => prev.filter(d => d.id !== designId));

    const { error } = await supabase
      .from('saved_designs')
      .delete()
      .eq('id', designId)
      .eq('user_id', user.id); // extra safety

    if (error) {
      console.error('deleteDesign error:', error);
      // Revert by re-fetching
      fetchDesigns(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: isAdmin(user),
      login,
      register,
      logout,
      savedDesigns,
      designsLoading,
      saveDesign,
      deleteDesign,
      refetchDesigns: () => fetchDesigns(user?.id),
      loading,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
