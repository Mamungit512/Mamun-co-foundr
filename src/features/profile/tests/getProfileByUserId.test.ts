import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock dependencies ---
// Mock calls prevent actual calls to APIs, databases, or external libraries
// Must mock the functions BEFORE importing so the unit test doesn't use the real function
// vi.mock("@/lib/supabaseClient", () => ({
//   createSupabaseClientWithToken: vi.fn(),
// }));

// vi.mock("@/lib/mapProfileToFromDBFormat", () => ({
//   mapProfileToOnboardingData: vi.fn(),
// }));
vi.mock("@/lib/supabaseClient");
vi.mock("@/lib/mapProfileToFromDBFormat");

// --- Imports ---
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileByUserId } from "../profileService";
import { createSupabaseClientWithToken } from "@/lib/supabaseClient";
import { mapProfileToOnboardingData } from "@/lib/mapProfileToFromDBFormat";

// Cast the mocked function
const mockCreateSupabaseClientWithToken = vi.mocked(
  createSupabaseClientWithToken,
);
const mockMapProfileToOnboardingData = vi.mocked(mapProfileToOnboardingData);

describe("getProfileByUserId", () => {
  // Create mock supabase object with supabase functions .from(), .select(), .eq(), .single()
  const mockFrom = vi.fn().mockReturnThis(); // mockReturnThis: allows us to chain methods. Returns the supabase client instead of result of api call
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn(); // mockSingle: Returns a promise with {data, error}

  const mockSupabase = {
    from: mockFrom,
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
  } as unknown as SupabaseClient;

  // beforeEach: sets up predictable testing environment before running test
  beforeEach(() => {
    vi.clearAllMocks(); // reset mock function state
    mockCreateSupabaseClientWithToken.mockReturnValue(mockSupabase); // specify to return "mockSupabase" object when using createSupabaseClientWithToken
  });

  // --- Test 1: Data Found ---
  it("should return mapped profile data when found", async () => {
    // Arrange - set up test data
    const fakeDbData = { id: "123", first_name: "Alice" };
    const fakeMapped = { id: "123", firstName: "Alice" };

    // Act - configure mocks and call function
    mockSingle.mockResolvedValue({ data: fakeDbData, error: null });
    mockMapProfileToOnboardingData.mockReturnValue(fakeMapped);

    const result = await getProfileByUserId("123", "fake-token");

    // Assert - verify results and interactions
    expect(result).toEqual(fakeMapped);
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("user_id", "123");
    expect(mockSingle).toHaveBeenCalled();
    expect(mockMapProfileToOnboardingData).toHaveBeenCalledWith(fakeDbData);
  });

  //  --- Test 2: Supabase Error ---
  it("should throw when Supabase returns an error", async () => {
    // Arrange
    const fakeError = new Error("DB error");

    // Act
    mockSingle.mockResolvedValue({ data: null, error: fakeError });

    // Assert
    await expect(getProfileByUserId("123", "fake-token")).rejects.toThrow(
      "DB error",
    );
  });

  //   --- Test 3: No Profile Found ---
  it("should handle case when no profile is found", async () => {
    // Arrange
    mockSingle.mockResolvedValue({ data: null, error: null });

    // Act & Assert
    await expect(getProfileByUserId("123", "fake-token")).rejects.toThrow();
  });

  it("should pass the correct token to Supabase client", async () => {
    // Arrange
    const testToken = "test-auth-token";
    const fakeDbData = { id: "456", first_name: "Bob" };
    const fakeMapped = { id: "456", firstName: "Bob" };

    mockSingle.mockResolvedValue({ data: fakeDbData, error: null });
    mockMapProfileToOnboardingData.mockReturnValue(fakeMapped);

    // Act
    await getProfileByUserId("456", testToken);

    // Assert
    expect(mockCreateSupabaseClientWithToken).toHaveBeenCalledWith(testToken);
  });

  //   --- Test 4: Token Verification ---
  it("should pass the correct token to Supabase client", async () => {
    // Arrange
    const testToken = "test-auth-token";
    const fakeDbData = { id: "456", first_name: "Bob" };
    const fakeMapped = { id: "456", firstName: "Bob" };

    mockSingle.mockResolvedValue({ data: fakeDbData, error: null });
    mockMapProfileToOnboardingData.mockReturnValue(fakeMapped);

    // Act
    await getProfileByUserId("456", testToken);

    // Assert
    expect(mockCreateSupabaseClientWithToken).toHaveBeenCalledWith(testToken);
  });
});
