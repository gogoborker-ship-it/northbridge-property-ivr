import { ClaimsDashboard } from "@/components/claims-dashboard";
import { sdkFiles, sourceFiles } from "@shared/surge/links";
import { presentHours } from "@shared/surge/read";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <ClaimsDashboard hours={presentHours()} sources={sourceFiles()} sdk={sdkFiles()} />
  );
}
