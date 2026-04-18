import Sidebar from "@/component/dashboard/sidebar";

import RightPanel from "@/component/dashboard/rightpanel";
import CenterPanel from "@/component/dashboard/centerPanel";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar />
      <CenterPanel />
      <RightPanel />
    </main>
  );
}
