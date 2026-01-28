/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "unsafe-none",
                    },
                ],
            },
            {
                source: "/",
                headers: [
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "unsafe-none",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
