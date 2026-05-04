import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BorrowerRepository } from '../BorrowerRepository';
import { supabaseAdmin, supabaseUser, TEST_USER_ID, ensureTestUser } from './test-utils';

vi.mock('../../services/auth', () => ({
  getCurrentUserId: vi.fn(() => Promise.resolve(TEST_USER_ID)),
}));

describe('BorrowerRepository Integration Test', () => {
  beforeEach(async () => {
    // Ensure the test user exists in auth.users
    await ensureTestUser();

    // Clean up
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);
  });

  afterEach(async () => {
    await supabaseAdmin.from('borrowers').delete().eq('user_id', TEST_USER_ID);
  });

  // --- GOOD PATHS ---

  it('should create and fetch a borrower', async () => {
    const input = {
      full_name: 'John Doe',
      phone: '1234567890',
      email: 'john@example.com',
      monthly_income: 5000
    };

    // Create
    const borrower = await BorrowerRepository.create(input, supabaseAdmin);
    expect(borrower).toBeDefined();
    expect(borrower.full_name).toBe('John Doe');
    
    // Fetch
    const fetched = await BorrowerRepository.getById(borrower.id!, supabaseAdmin);
    expect(fetched).not.toBeNull();
    expect(fetched?.email).toBe('john@example.com');
  });

  it('should update a borrower', async () => {
    const input = { full_name: 'Jane Doe', phone: '0987654321' };
    const borrower = await BorrowerRepository.create(input, supabaseAdmin);
    
    const updateInput = { ...input, full_name: 'Jane Smith', monthly_income: 6000 };
    const updated = await BorrowerRepository.update(borrower.id!, updateInput, supabaseAdmin);
    
    expect(updated.full_name).toBe('Jane Smith');
    expect(updated.monthly_income).toBe(6000);
  });

  it('should get all borrowers for the user', async () => {
    await BorrowerRepository.create({ full_name: 'Borrower 1', phone: '111' }, supabaseAdmin);
    await BorrowerRepository.create({ full_name: 'Borrower 2', phone: '222' }, supabaseAdmin);

    const all = await BorrowerRepository.getAll(supabaseAdmin);
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.some(b => b.full_name === 'Borrower 1')).toBeTruthy();
  });

  // --- SAD PATHS ---

  it('should return null for non-existent borrower ID', async () => {
    const nonExistentId = '11111111-1111-1111-1111-111111111111';
    const fetched = await BorrowerRepository.getById(nonExistentId, supabaseAdmin);
    expect(fetched).toBeNull();
  });

  it('should not allow fetching borrower of another user (RLS Check)', async () => {
    const otherUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    await supabaseAdmin.auth.admin.createUser({
      id: otherUserId,
      email: `other-lender-${Date.now()}@example.com`,
      password: 'password123',
      email_confirm: true,
    }).catch(() => {});

    // Insert as admin for another user
    const { data } = await supabaseAdmin.from('borrowers').insert({
      full_name: 'Other Borrower',
      user_id: otherUserId,
      phone: '999'
    }).select('id').single();

    // Fetch using the anon key (supabaseUser) which mimics testUserId
    const result = await BorrowerRepository.getById(data!.id, supabaseUser);
    
    // RLS should hide this record
    expect(result).toBeNull();

    await supabaseAdmin.from('borrowers').delete().eq('user_id', otherUserId);
    await supabaseAdmin.auth.admin.deleteUser(otherUserId);
  });

  it('should throw error when updating a non-existent borrower', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const updateInput = { full_name: 'Ghost', phone: '000' };
    
    // update() uses .single() which throws PGRST116 if no rows matched
    await expect(BorrowerRepository.update(nonExistentId, updateInput, supabaseAdmin))
      .rejects.toThrow();
  });

  it('should throw error when creating a borrower with invalid data', async () => {
    // missing phone which is likely required in DB
    const invalidInput = { full_name: 'Invalid' } as any;
    
    await expect(BorrowerRepository.create(invalidInput, supabaseAdmin))
      .rejects.toThrow();
  });
});
