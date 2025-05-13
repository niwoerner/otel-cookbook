import DashboardSidebar from "../components/sidebar";
import { YamlPreview } from "../components/Cook/generated-collector-config";

export default async function Preview() {
  return (
    <div>
      <DashboardSidebar DashboardContent={<YamlPreview />} />
    </div>
  );
}
