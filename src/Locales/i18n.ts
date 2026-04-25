import { init, register } from "svelte-i18n";

export function RegisterLocales() {
  // dumb ahh error
  // @ts-ignore
  register("en", () => import("./en.yaml"));
  init({
    initialLocale: "en",
    fallbackLocale: "en",
  });
}
