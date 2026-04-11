export default function JobDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="animate-pulse space-y-6">
        <div className="space-y-2">
          <div className="bg-muted h-9 w-4/5 max-w-xl rounded-md" />
          <div className="bg-muted h-4 w-2/5 max-w-xs rounded-md" />
        </div>
        <div className="bg-muted h-32 w-full rounded-lg" />
        <div className="bg-muted h-24 w-full rounded-lg" />
        <div className="bg-muted h-28 w-full rounded-lg" />
      </div>
    </div>
  );
}
