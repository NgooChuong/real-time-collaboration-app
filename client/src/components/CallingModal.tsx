type CallingModalProps = {
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
};
const CallingModal = ({
  callerName,
  onAccept,
  onReject,
}: CallingModalProps) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
      <p className="text-xl mb-4">Cuộc gọi từ {callerName}</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onAccept}
          className="bg-green-500 text-white px-6 py-2 rounded-full"
        >
          Chấp nhận
        </button>
        <button
          onClick={onReject}
          className="bg-red-500 text-white px-6 py-2 rounded-full"
        >
          Từ chối
        </button>
      </div>
    </div>
  </div>
);

export default CallingModal;
