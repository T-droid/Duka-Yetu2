import Link from "next/link";

const HeaderLoading = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-xl text-foreground">HostelCart</span>
        </Link>
        
        {/* Loading Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Loading Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </header>
);

export default HeaderLoading;
