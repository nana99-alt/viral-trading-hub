import { I18nProvider } from "@/i18n";
import { router } from "@/routes";
import { RouterProvider } from "@tanstack/react-router";

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
}
