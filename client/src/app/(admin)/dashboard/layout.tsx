import { auth } from "@/auth";
import AdminContent from "@/components/layout/admin.content";
import AdminFooter from "@/components/layout/admin.footer";
import AdminHeader from "@/components/layout/admin.header";
import AdminSideBar from "@/components/layout/admin.sidebar";
import { AdminContextProvider } from "@/library/admin.context";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await auth();
    return (
        <AdminContextProvider>
            <div style={{ display: "flex" }}>
                <div className="left-side" style={{ minWidth: 80 }}>
                    <AdminSideBar />
                </div>
                <div className="right-side" style={{ flex: 1 }}>
                    <AdminHeader user={user} />
                    <AdminContent>{children}</AdminContent>
                    <AdminFooter />
                </div>
            </div>
        </AdminContextProvider>
    );
}
