/**
 * Clears password-type inputs by `name` so values are not left in the DOM after
 * reading them for a request (or after a failed client-side check).
 */
export function clearPasswordFieldsInForm(
  form: HTMLFormElement,
  names: readonly string[] = ["password", "confirmPassword"]
): void {
  for (const name of names) {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement) {
      el.value = "";
    }
  }
}
