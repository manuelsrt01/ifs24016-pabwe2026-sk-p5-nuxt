// Pembungkus async action Pinia: mengatur flag loading/done + pesan sukses/error pada state store.
export async function runTask(
  state: Record<string, any>,
  loading: string,
  done: string,
  task: () => Promise<string>,
): Promise<boolean> {
  state[loading] = true;
  state[done] = false;
  state.error = "";
  try {
    state.message = await task();
    state[done] = true;
    return true;
  } catch (e) {
    state.error = (e as Error).message;
    return false;
  } finally {
    state[loading] = false;
  }
}
