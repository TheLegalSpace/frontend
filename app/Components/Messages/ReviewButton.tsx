// app/Components/Messages/ReviewButton.tsx
"use client";

interface Props {
  isClosed: boolean;
  hasReviewed: boolean;
  onClick: () => void;
}

export default function ReviewButton({ isClosed, hasReviewed, onClick }: Props) {
  const disabled = !isClosed || hasReviewed;

  const title = hasReviewed
    ? "You have already reviewed this conversation"
    : !isClosed
      ? "Close the conversation first to leave a review"
      : "Leave a review";

  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      title={title}
      className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
        hasReviewed
          ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
          : isClosed
            ? "bg-gray-900 text-white hover:bg-gray-700 cursor-pointer"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
    >
      {hasReviewed ? "Reviewed" : "Review"}
    </button>
  );
}