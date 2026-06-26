import MembershipPage from '@/app/Components/MembershipPage';

export const metadata = {
    title: "Membership | The Legal Space",
    description:
      "Manage your TLS membership — upgrade to a professional plan, update your billing details, and view your invoice history.",
};

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Fixed heading */}
      <div className="fixed top-0 left-[220px] right-0 bg-white z-10 border-b border-[#E6EAED]">
        <div className="px-6 pt-5 pb-1">
          <p className="text-[22px] font-regular text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Membership
          </p>
          <span className="block mb-[17px]" />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[75px]" />

      <MembershipPage />
    </div>
  )
}