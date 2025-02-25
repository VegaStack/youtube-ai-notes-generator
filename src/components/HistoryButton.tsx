'use client';

import { ClockIcon } from '@heroicons/react/24/outline';
import { useHistoryStore } from '@/lib/historyStore';

export default function HistoryButton() {
  const { toggleHistory } = useHistoryStore();
  
  return (
    <button
      onClick={toggleHistory}
      className="text-primary-1300 hover:text-primary-1100 flex items-center text-sm p-2 rounded-md transition-colors duration-200"
      aria-label="View history"
      title="View your watch history"
    >
      <ClockIcon className="w-5 h-5 mr-1" />
      <span className="hidden sm:inline">History</span>
    </button>
  );
}