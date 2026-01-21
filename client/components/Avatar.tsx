'use client';

interface AvatarProps {
  username?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ username, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (name: string) => {
    if (!name || !name.trim()) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ];

  const safeUsername = username || 'User';
  const colorIndex = safeUsername.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      title={safeUsername}
    >
      {getInitials(safeUsername)}
    </div>
  );
}
