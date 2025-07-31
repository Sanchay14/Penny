import { BarLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div className="w-48 h-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="w-32 h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="md:col-span-1">
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
      
      <div className="w-full">
        <BarLoader color="#3b82f6" width="100%" />
      </div>
    </div>
  );
}
