import Image from "next/image";

const NoMessageContent = ({send}) => {
  return (
    <div className="flex-1 overflow-y-auto mt-[30%] sm:mt-[15%] md:mt-[13%] lg:mt-[10%]">
      <div className="min-h-full flex flex-col items-center justify-center text-center px-4">
        <Image
          src="/images/favicon.svg"
          width={64}
          height={64}
          alt="logo"
          className="w-12 h-12 sm:w-16 sm:h-16"
        />

        <h1 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">
          Where should we begin?
        </h1>

        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Ask anything about your documents
        </p>

        <div className="mt-6 flex flex-col gap-3 w-3/4 max-w-md">
          {[
            "What can you do for me?",
            "Who are you?",
            "What topics can you help me with?",
          ].map((text, i) => (
            <button
              key={i}
              className="cursor-pointer bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition text-center"
              onClick={() => send(text)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoMessageContent;
