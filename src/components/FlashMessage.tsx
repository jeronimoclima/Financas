type FlashMessageProps = {
  message: string;
  type: "success" | "error";
};

export const FlashMessage = ({ message, type }: FlashMessageProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className={`relative px-10 py-6 rounded-3xl text-white text-lg font-bold shadow-2xl
        ${type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}
      >
        {message}
      </div>
    </div>
  );
};
