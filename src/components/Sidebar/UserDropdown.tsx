import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function UserDropdown() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-2 mb-2">
      <button className="flex items-center gap-2 w-full p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-left">
        <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
          {user?.name?.[0] || 'U'}
        </div>
        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
          {user?.name || 'User'}&apos;s Space
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
