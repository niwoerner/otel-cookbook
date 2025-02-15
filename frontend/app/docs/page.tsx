import { Docs } from "../components/Docs/docs";
import DashboardSidebar from "../components/sidebar";

export default async function Preview() {
  return (
    <div>
      <DashboardSidebar DashboardContent={<Docs />} />
    </div>
  );
}
