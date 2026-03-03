import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service here
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                    <img
                        src="https://img.freepik.com/free-vector/oops-404-error-with-broken-robot-concept-illustration_114360-1920.jpg"
                        alt="Error"
                        className="w-1/3 mb-8"
                    />
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Oops! Something went wrong.</h1>
                    <p className="text-gray-600 mb-6">We're experiencing a technical issue. Please try refreshing the page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-primary-blue text-white px-6 py-2 rounded shadow hover:shadow-lg transition-shadow"
                    >
                        Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-8 text-left max-w-2xl bg-white p-4 rounded shadow text-sm overflow-auto">
                            <summary className="text-red-500 font-medium cursor-pointer mb-2">Error Details</summary>
                            <pre className="text-gray-700 whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;