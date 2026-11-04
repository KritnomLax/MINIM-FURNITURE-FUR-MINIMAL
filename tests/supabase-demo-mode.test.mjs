import assert from 'node:assert/strict';
import { supabase } from '../src/config/supabaseClient.js';

const productsResult = await supabase.from('products').select('*').order('id', { ascending: true });

assert.equal(productsResult.error, null, 'demo mode should return no query error');
assert.ok(Array.isArray(productsResult.data), 'demo mode should provide demo product data');
assert.ok(productsResult.data.length > 0, 'demo products should not be empty');
assert.equal(supabase.demoMode, true, 'supabase client should flag demo mode when env is missing');

const sessionResult = await supabase.auth.getSession();
assert.equal(sessionResult.error, null, 'auth session should resolve without an error in demo mode');
assert.equal(sessionResult.data.session, null, 'demo auth should start unauthenticated');

console.log('demo-mode checks passed');
