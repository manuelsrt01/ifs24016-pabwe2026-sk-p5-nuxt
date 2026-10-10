import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import Swal from "sweetalert2";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

// jsdom tidak punya URL.createObjectURL
URL.createObjectURL = vi.fn(() => "blob:preview");
URL.revokeObjectURL = vi.fn();

beforeEach(() => {
  localStorage.clear();
  (URL.createObjectURL as any).mockClear();
  (URL.revokeObjectURL as any).mockClear();
  (Swal.fire as any).mockReset();
  (Swal.fire as any).mockResolvedValue({ isConfirmed: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});
