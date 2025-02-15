import DashboardSidebar from "../components/sidebar";
import { YamlPreview } from "../components/Generate/generated-collector-config";

export default async function Preview() {
  return (
    <div>
      <DashboardSidebar DashboardContent={<YamlPreview />} />
    </div>
  );
}
