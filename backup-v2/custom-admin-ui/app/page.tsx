export default function HomePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center space-y-6 p-8">
                <h1 className="text-4xl font-bold text-gray-900">
                    🎨 Custom Admin Panel
                </h1>
                <p className="text-lg text-gray-600">
                    WordPress to Next.js Migration Project
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/login"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Login to Admin
                    </a>
                    <a
                        href="/dashboard"
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Dashboard (Protected)
                    </a>
                </div>
                <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
                    <h2 className="font-semibold text-lg mb-2">📋 Project Status</h2>
                    <ul className="text-left space-y-2 text-sm">
                        <li>✅ Payload CMS Backend - Configured</li>
                        <li>✅ Custom Admin UI - In Progress</li>
                        <li>⏳ Next.js Storefront - Pending</li>
                        <li>⏳ Data Migration Scripts - Pending</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
