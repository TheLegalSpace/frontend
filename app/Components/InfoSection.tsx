// components/InfoSection.tsx
import Image from "next/image";

export default function InfoSection() {
  return (
    <section className="bg-[#161C2D] py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 xl:px-16">
      <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
        {/* Row 1: Text Left, Image Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="space-y-4 md:space-y-6 order-1">
            <h2 className="text-2xl md:text-3xl lg:text-[30px] text-white leading-tight lg:leading-snug font-medium">
              Finding the right lawyer shouldn&apos;t feel like guesswork
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed lg:leading-7">
              Finding legal assistance can often feel overwhelming for many individuals. 
              They frequently depend on referrals or go through a process of trial and 
              error, making it challenging to determine whom to trust or how to initiate 
              a conversation. TheLegalSpace addresses these concerns by providing a secure 
              platform where users can explore various options, gain a clearer understanding 
              of their circumstances, and connect with the appropriate legal expert, all in 
              a pressure-free environment. This method empowers users to navigate the 
              complexities of the legal landscape with both confidence and ease.
            </p>
            <button className="bg-[#1A56DB] text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm transition-colors">
              Get Legal Help
            </button>
          </div>
          
          <div className="order-2">
            <div className="relative aspect-4/3 md:aspect-auto md:h-100 lg:h-125">
              <Image
                src="/worried.png"
                alt="Person feeling overwhelmed about legal matters"
                fill
                className="object-cover rounded-2xl md:rounded-3xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Image Left, Text Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="order-2 md:order-1">
            <div className="relative aspect-4/3 md:aspect-auto md:h-100 lg:h-125">
              <Image
                src="/two-lawyers.jpg"
                alt="Legal professionals ready to help"
                fill
                className="object-cover rounded-2xl md:rounded-3xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          
          <div className="space-y-4 md:space-y-6 order-1 md:order-2">
            <h2 className="text-2xl md:text-3xl lg:text-[30px] text-white leading-tight lg:leading-snug font-medium">
              A better way for lawyers to connect with the right clients
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed lg:leading-7">
              Legal professionals have the expertise needed to navigate complex legal 
              issues, yet they often face challenges in connecting with clients who 
              genuinely need their services in a manner that is ethical and respectful. 
              TheLegalSpace effectively bridges this gap by offering a comprehensive 
              platform where verified lawyers and forward-thinking firms can showcase 
              their services. Rather than resorting to aggressive client acquisition 
              tactics, these professionals become easily discoverable and build credibility, 
              ensuring they are accessible when clients require assistance the most. This 
              organized approach not only strengthens the relationships between clients 
              and lawyers but also reinforces the integrity and ethical standards of the 
              legal profession.
            </p>
            <button className="bg-[#1A56DB] text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm transition-colors">
              I&apos;m a Legal Professional
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}