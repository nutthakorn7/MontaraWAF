'use client';

import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusClasses = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium`}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : name ? (
          getInitials(name)
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${statusClasses[status]} rounded-full ring-2 ring-white dark:ring-gray-900`}
        />
      )}
    </div>
  );
}

// Avatar Group
export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
}: {
  avatars: Omit<AvatarProps, 'size'>[];
  max?: number;
  size?: AvatarProps['size'];
}) {
  const visible = avatars.slice(0, max);
  const hidden = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {hidden > 0 && (
        <div
          className={`${sizeClasses[size || 'md']} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium ring-2 ring-white dark:ring-gray-900`}
        >
          +{hidden}
        </div>
      )}
    </div>
  );
}
