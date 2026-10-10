import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

const event = (value: string) => ({ target: { value } }) as unknown as Event;

describe("useInput", () => {
  it("memakai nilai awal", () => {
    const { value } = useInput("awal");
    expect(value.value).toBe("awal");
  });

  it("onChange memperbarui nilai dari event input", () => {
    const { value, onChange } = useInput("");
    onChange(event("baru"));
    expect(value.value).toBe("baru");
  });

  it("reset mengembalikan nilai awal", () => {
    const { value, onChange, reset } = useInput("awal");
    onChange(event("ubah"));
    reset();
    expect(value.value).toBe("awal");
  });
});
