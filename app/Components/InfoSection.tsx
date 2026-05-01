import Image from "next/image";

export default function InfoSection () {
    return (
        <section className="bg-[#161C2D] py-24 px-42 space-y-20">
            <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                    <p className="text-white text-[30px] leading-12.5 font-['Geist']">Finding the right lawyer shouldn't feel like guesswork</p>
                    <p className="text-[#FFFFFFCC] text-[16px] font-['Geist'] leading-10">Finding legal assistance can often feel overwhelming for many individuals. They frequently depend on referrals or go through a process of trial and error, making it challenging to determine whom to trust or how to initiate a conversation. TheLegalSpace addresses these concerns by providing a secure platform where users can explore various options, gain a clearer understanding of their circumstances, and connect with the appropriate legal expert, all in a pressure-free environment. This method empowers users to navigate the complexities of the legal landscape with both confidence and ease.</p>
                    <button className="mt-6 bg-[#1A56DB] text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm transition">
                        Get Legal Help
                    </button>
                </div>
                <div>
                    <Image  
                    src="/worried.png"
                    alt="Worried"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover rounded-3xl"
                    />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                    <Image
                    src="/two-lawyers.jpg"
                    alt="Two Lawyers"
                    width={500}
                    height={500}
                    className="w-full h-full object-cover rounded-3xl"
                    />
                </div>
                <div>
                    <p className="text-white text-[30px] leading-12.5 font-['Geist']">A better way for lawyers to connect with the right clients</p>
                    <p className="text-[#FFFFFFCC] text-[16px] font-['Geist'] leading-10">Legal professionals have the expertise needed to navigate complex legal issues, yet they often face challenges in connecting with clients who genuinely need their services in a manner that is ethical and respectful. TheLegalSpace effectively bridges this gap by offering a comprehensive platform where verified lawyers and forward-thinking firms can showcase their services. Rather than resorting to aggressive client acquisition tactics, these professionals become easily discoverable and build credibility, ensuring they are accessible when clients require assistance the most. This organized approach not only strengthens the relationships between clients and lawyers but also reinforces the integrity and ethical standards of the legal profession.</p>
                    <button className="mt-6 bg-[#1A56DB] text-white hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm transition">
                        I'm a Legal Professional
                    </button>
                </div>
            </div>
        </section>
    )
}