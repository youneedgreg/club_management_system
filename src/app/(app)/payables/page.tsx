import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { enforceModule } from "@/lib/auth/session";

export default async function Page() {
  await enforceModule("payables");
  return <ModulePlaceholder titleKey="payables" icon="banknote" color="var(--gold)" phase={12} />;
}
