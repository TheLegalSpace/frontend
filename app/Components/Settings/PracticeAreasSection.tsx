// components/settings/PracticeAreasSection.tsx
"use client";

import { useState } from "react";
import PracticeAreasModal from "./PracticeAreasModal";
import { PracticeArea } from "@/services/practice-areas.services";

interface Props {
  practiceAreas: PracticeArea[];
  currentAreaNames: string[];
  currentIds: string[];
  primaryId: string;
  secondaryId: string;
  role: string;
}

export default function PracticeAreasSection({
  practiceAreas,
  currentAreaNames,
  currentIds,
  primaryId,
  secondaryId,
  role,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  // Lawyers: max 2 (primary + secondary). Firms: max 7.
  const maxSelect = role === "LAWYER" ? 2 : 7;

  return (
    <>
      <div className="py-6 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Practice Areas
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-[13px] font-medium text-[#2563EB] hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentAreaNames.length === 0 ? (
            <p className="text-[13px] text-gray-400">
              No practice areas added yet
            </p>
          ) : (
            currentAreaNames.map((name, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] text-[12px] font-medium rounded-full"
              >
                {name}
              </span>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <PracticeAreasModal
          practiceAreas={practiceAreas}
          currentIds={currentIds}
          primaryId={primaryId}
          secondaryId={secondaryId}
          maxSelect={maxSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
