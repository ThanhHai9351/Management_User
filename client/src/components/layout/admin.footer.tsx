'use client'
import { Layout } from 'antd';

const AdminFooter = () => {
    const { Footer } = Layout;

    return (
        <>
            <Footer style={{ textAlign: 'center' }}>
                ©{new Date().getFullYear()} Created by @Hari
            </Footer>
        </>
    )
}

export default AdminFooter;