import VerifyPage from '@/app/(guest)/verify/[slug]/verify';
import React from 'react';

interface Props {
    params: { slug: string };
}

const Page = ({ params }: Props) => {
    return (
        <VerifyPage id={params.slug || ''} />
    );
}

export default Page;
