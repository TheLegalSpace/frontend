import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-42 py-4 border-b">
      <Image src="/logo.png" alt="Logo" width={112.36} height={32} />

      <div className="flex gap-4 items-center">
        <Link href="/signin" className="text-sm">
          Lawyer Login
        </Link>

        <button className="text-sm bg-[#1A56DB] text-white px-3 py-2.5 rounded-lg gap-2.5">
          Find a Lawyer
        </button>
      </div>
    </div>
  );
}
