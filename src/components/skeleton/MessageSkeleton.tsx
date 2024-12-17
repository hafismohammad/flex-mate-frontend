function MessageSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 items-start w-52 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-400"></div>
        <div className="w-full flex flex-col gap-2">
          <div className="h-6 w-28 bg-gray-400 rounded"></div>
          <div className="h-4 w-full bg-gray-400 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-400 rounded"></div>
        </div>
      </div>

      <div className="flex flex-col gap-4 items-end w-52 animate-pulse mt-5 ml-auto">
        <div className="w-10 h-10 rounded-full bg-gray-400 self-end"></div>
        <div className="w-full flex flex-col gap-2 items-end">
          <div className="h-6 w-28 bg-gray-400 rounded"></div>
          <div className="h-4 w-full bg-gray-400 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-400 rounded"></div>
        </div>
      </div>

      <div className="flex flex-col gap-4 items-start w-52 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-400"></div>
        <div className="w-full flex flex-col gap-2">
          <div className="h-6 w-28 bg-gray-400 rounded"></div>
          <div className="h-4 w-full bg-gray-400 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-400 rounded"></div>
        </div>
      </div>
    </>
  );
}

export default MessageSkeleton;
