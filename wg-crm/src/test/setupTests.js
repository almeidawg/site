import '@testing-library/jest-dom/vitest';

const createSupabaseMock = () => {
  const mock = {
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    from: vi.fn(() => mock),
    select: vi.fn(() => mock),
    eq: vi.fn(() => mock),
    order: vi.fn(() => mock),
    is: vi.fn(() => mock),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
  };
  return mock;
};

const supabaseMock = createSupabaseMock();

vi.mock('@/lib/customSupabaseClient', () => ({
  supabase: supabaseMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});
