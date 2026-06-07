"use client";

import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import signupImage from "../../public/signinbg.jpg";
import logoImg from "../../public/logo.png";
import Link from "next/link";

const Signin = () => {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <Image
        src={signupImage} // replace with your image
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Logo */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 text-white font-semibold tracking-wide"
      >
        <Image src={logoImg} alt="logo" width={100} height={200} />
      </Link>

      {/* Card */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-8 py-10 w-[90%] max-w-md text-center shadow-2xl">
        <h2 className="text-white text-xl font-semibold mb-2">
          Get started with TheLegalSpace
        </h2>

        <p className="text-gray-300 text-sm mb-6">
          Access legal help faster. No passwords. No hassle.
        </p>

        {/* Google Button */}
        <button className="flex items-center justify-center gap-3 w-full py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-[.03s] cursor-pointer    ">
          <FcGoogle size={20} />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Signin;
