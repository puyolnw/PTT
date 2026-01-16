import AppLayout from "./components/AppLayout";
import SidebarDocuments from "@/components/sidebar/SidebarDocuments";

export default function LayoutDocuments() {
  return <AppLayout SidebarComponent={SidebarDocuments} />;
}
