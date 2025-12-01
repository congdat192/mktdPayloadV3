export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">Your Site Name</h1>
                    <nav className="mt-4 flex gap-6">
                        <a href="/" className="text-gray-600 hover:text-gray-900">
                            Home
                        </a>
                        <a href="/blog" className="text-gray-600 hover:text-gray-900">
                            Blog
                        </a>
                        <a href="/san-pham" className="text-gray-600 hover:text-gray-900">
                            Products
                        </a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-5xl font-bold mb-4">
                        Welcome to Your New Site
                    </h2>
                    <p className="text-xl mb-8">
                        Migrated from WordPress to Next.js + Payload CMS
                    </p>
                    <div className="flex gap-4 justify-center">
                        <a
                            href="/blog"
                            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Read Blog
                        </a>
                        <a
                            href="/san-pham"
                            className="px-6 py-3 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Shop Now
                        </a>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto px-4 py-16">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Latest Posts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Placeholder cards */}
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="h-48 bg-gray-200"></div>
                            <div className="p-6">
                                <h4 className="font-bold text-lg mb-2">Sample Post {i}</h4>
                                <p className="text-gray-600">
                                    This is a placeholder. Posts will be loaded from Payload CMS.
                                </p>
                                <a href="#" className="text-blue-600 mt-4 inline-block">
                                    Read more →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p>© 2025 Your Site Name. All rights reserved.</p>
                    <p className="text-gray-400 mt-2">
                        Powered by Next.js + Payload CMS
                    </p>
                </div>
            </footer>
        </main>
    )
}
