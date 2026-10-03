import Image from "next/image";

export function PageIllustration() {
  return (
    <>
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 -translate-x-1/2 transform"
        aria-hidden
      >
        <Image
          className="max-w-none"
          src="/assets/landing/stripes.svg"
          width={768}
          height={432}
          alt=""
          priority
        />
      </div>
      <div
        className="pointer-events-none absolute -top-32 left-1/2 ml-[580px] -translate-x-1/2"
        aria-hidden
      >
        <div className="h-80 w-80 rounded-full bg-linear-to-tr from-indigo-accent opacity-50 blur-[160px]" />
      </div>
      <div
        className="pointer-events-none absolute top-[420px] left-1/2 ml-[380px] -translate-x-1/2"
        aria-hidden
      >
        <div className="h-80 w-80 rounded-full bg-linear-to-tr from-indigo-accent to-gray-900 opacity-50 blur-[160px]" />
      </div>
      <div
        className="pointer-events-none absolute top-[640px] left-1/2 -ml-[300px] -translate-x-1/2"
        aria-hidden
      >
        <div className="h-80 w-80 rounded-full bg-linear-to-tr from-indigo-accent to-gray-900 opacity-50 blur-[160px]" />
      </div>
    </>
  );
}
