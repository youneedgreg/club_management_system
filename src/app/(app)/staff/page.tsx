import { ModulePlaceholder } from "@/components/shell/module-placeholder";
import { enforceModule } from "@/lib/auth/session";

export default async function Page() {
  await enforceModule("staff");
  return <ModulePlaceholder titleKey="staff" icon="staff" color="var(--green)" phase={13} />;
}
