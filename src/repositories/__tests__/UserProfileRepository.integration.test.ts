import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserProfileRepository } from '../UserProfileRepository';
import { supabaseAdmin, supabaseUser, TEST_USER_ID } from './test-utils';

describe('UserProfileRepository Integration Test', () => {
  // Before each test, ensure we have a clean state for our test user
  beforeEach(async () => {
    // 1. Ensure the test user exists in auth.users
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(TEST_USER_ID);
    
    if (!userData || !userData.user) {
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        id: TEST_USER_ID,
        email: `test-profile-${TEST_USER_ID}@example.com`,
        password: 'password123',
        email_confirm: true,
      });
      
      if (createError) {
        console.warn('Could not create test user (may already exist):', createError.message);
      }
    }

    // 2. Clean up any existing profile
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', TEST_USER_ID);
  });

  // After tests, clean up
  afterEach(async () => {
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', TEST_USER_ID);
    
    // Optional: Delete the test user too
    // await supabaseAdmin.auth.admin.deleteUser(TEST_USER_ID);
  });

  it('should return null if profile does not exist', async () => {
    const profile = await UserProfileRepository.getByUserId(TEST_USER_ID, supabaseAdmin);
    expect(profile).toBeNull();
  });

  it('should upsert and fetch a user profile', async () => {
    const newProfile = {
      legal_full_name: 'Test Lender',
      display_name: 'Test Lender',
      initial_capital: 1000,
      initial_profit: 0,
    };

    // 1. Perform the upsert
    const result = await UserProfileRepository.upsertByUserId(TEST_USER_ID, newProfile, supabaseAdmin);
    expect(result).not.toBeNull();
    expect(result?.legal_full_name).toBe('Test Lender');

    // 2. Verify we can fetch it back
    const fetched = await UserProfileRepository.getByUserId(TEST_USER_ID, supabaseAdmin);
    expect(fetched).not.toBeNull();
    expect(fetched?.display_name).toBe('Test Lender');
  });

  it('should handle partial updates in upsertByUserId', async () => {
    // 1. Initial upsert (including all required fields for creation)
    await UserProfileRepository.upsertByUserId(TEST_USER_ID, {
      legal_full_name: 'Initial Name',
      display_name: 'Initial Display',
      initial_capital: 500,
      initial_profit: 0
    }, supabaseAdmin);

    // 2. Partial update (only change name)
    const result = await UserProfileRepository.upsertByUserId(TEST_USER_ID, {
      legal_full_name: 'Updated Name',
    }, supabaseAdmin);

    expect(result?.legal_full_name).toBe('Updated Name');
    expect(result?.initial_capital).toBe(500); // Should remain unchanged if upsert logic handles it
  });

  it('should not allow fetching profiles of other users (RLS Check)', async () => {
    const otherUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Ensure the other user exists
    await supabaseAdmin.auth.admin.createUser({
      id: otherUserId,
      email: `other-lender-${Date.now()}@example.com`,
      password: 'password123',
      email_confirm: true,
    }).catch(() => {});

    // Create a profile for the OTHER user using Admin key
    await supabaseAdmin.from('user_profiles').insert({
      user_id: otherUserId,
      legal_full_name: 'Other Lender',
      display_name: 'Other',
      initial_capital: 0,
      initial_profit: 0
    });

    // Try to fetch it as the TEST user using the ANON key
    // This should return null because RLS should block the selection
    const result = await UserProfileRepository.getByUserId(otherUserId, supabaseUser);
    expect(result).toBeNull();

    // Clean up other user
    await supabaseAdmin.from('user_profiles').delete().eq('user_id', otherUserId);
  });
});
