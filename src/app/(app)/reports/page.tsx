import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { enforceModule } from "@/lib/auth/session";

export default async function Page() {
  await enforceModule("reports");
  return <ModulePlaceholder titleKey="reports" icon="reports" color="var(--gold)" phase={14} />;
}
