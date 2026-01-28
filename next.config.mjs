/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "unsafe-none", // Allow popups to communicate freely
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
