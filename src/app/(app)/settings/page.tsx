import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { enforceModule } from "@/lib/auth/session";

export default async function Page() {
  await enforceModule("settings");
  return <ModulePlaceholder titleKey="settings" icon="settings" color="var(--blue)" phase={15} />;
}
