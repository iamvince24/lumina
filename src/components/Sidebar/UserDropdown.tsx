import { ChevronDown, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function UserDropdown() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  return (
    <div className="p-2 mb-2">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-left"
      >
        <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
          {user?.name?.[0] || 'U'}
        </div>
        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
          {user?.name || 'User'}&apos;s Space
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9999]"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-10000 overflow-hidden"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 transition-colors text-left text-sm text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
