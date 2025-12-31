import AppLayout from "./components/AppLayout";
import SidebarDocuments from "@/components/SidebarDocuments";

export default function LayoutDocuments() {
  return <AppLayout SidebarComponent={SidebarDocuments} />;
}
