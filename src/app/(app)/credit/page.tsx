import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { enforceModule } from "@/lib/auth/session";

export default async function Page() {
  await enforceModule("credit");
  return <ModulePlaceholder titleKey="credit" icon="credit" color="var(--blue)" phase={11} />;
}
