"use client";

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8">
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-2xl">
        <p className="font-semibold text-lg mb-2">Users page error</p>
        <p className="text-sm font-mono mb-1">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-red-500 font-mono">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
