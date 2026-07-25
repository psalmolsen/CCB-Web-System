export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ccb-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-ccb-navy">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-ccb-navy">Page not found</h2>
        <p className="mt-2 text-sm text-ccb-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-ccb-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ccb-navy"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
