import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { enforceModule } from "@/lib/auth/session";

export default async function Page() {
  await enforceModule("lineup");
  return <ModulePlaceholder titleKey="lineup" icon="calendar" color="var(--violet)" phase={10} />;
}
