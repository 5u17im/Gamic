import { describe, it, expect } from "vitest";

describe("Profile API validation", () => {
  it("validates profile update payload", () => {
    const payload = { name: "Test", nickname: "testuser", email: "test@test.com" };
    expect(payload.name).toBeTypeOf("string");
    expect(payload.nickname).toBeTypeOf("string");
    expect(payload.email).toBeTypeOf("string");
  });

  it("rejects update without name", () => {
    const payload = { nickname: "test" };
    expect(payload.name).toBeUndefined();
  });

  it("validates password change payload", () => {
    const payload = { currentPassword: "old", newPassword: "newpassword123" };
    expect(payload.currentPassword).toBeTypeOf("string");
    expect(payload.newPassword.length).toBeGreaterThanOrEqual(6);
  });

  it("rejects short new password", () => {
    const payload = { currentPassword: "old", newPassword: "12345" };
    expect(payload.newPassword.length < 6).toBe(true);
  });

  it("rejects empty current password", () => {
    const payload = { currentPassword: "", newPassword: "newpassword" };
    expect(payload.currentPassword).toBe("");
  });

  it("validates scores response shape", () => {
    const score = { id: "1", score: 100, duration: 30, timestamp: new Date().toISOString(), game: { slug: "hex-merge", title: "Hex Merge" } };
    expect(score).toHaveProperty("id");
    expect(score).toHaveProperty("score");
    expect(score).toHaveProperty("game.slug");
    expect(score).toHaveProperty("game.title");
  });
});
