import Image from "next/image";

export default function Logo({ className_ }: { className_?: string }) {
  return (
    <Image
      src="/Logo.svg"
      alt="FundX Logo"
      width={32}
      height={16}
      className_={className_}
    />
  );
}