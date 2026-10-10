import { ref } from "vue";

export function useInput(initialValue: string) {
  const value = ref(initialValue);
  const onChange = (event: Event) => {
    value.value = (event.target as HTMLInputElement).value;
  };
  const reset = () => {
    value.value = initialValue;
  };
  return { value, onChange, reset };
}
