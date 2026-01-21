import { Edit2, Trash2, Plus } from 'lucide-react';

interface PlatformProfile {
  username?: string;
  solved?: number;
  rating?: number;
  maxRating?: number;
}

interface PlatformCardProps {
  platform: 'leetcode' | 'codeforces' | 'codechef';
  profile: PlatformProfile | undefined;
  onConnect: (platform: 'leetcode' | 'codeforces' | 'codechef') => void;
  onEdit: (platform: 'leetcode' | 'codeforces' | 'codechef') => void;
  onRemove: (platform: string) => void;
}

export default function PlatformCard({
  platform,
  profile,
  onConnect,
  onEdit,
  onRemove,
}: PlatformCardProps) {
  const isConnected = !!profile?.username;

  const renderProfileDetails = () => {
    if (!isConnected) return <p className="text-gray-400 text-sm">Not connected</p>;

    switch (platform) {
      case 'leetcode':
        return (
          <>
            <p className="text-sm text-gray-300 mb-2">@{profile.username}</p>
            <p className="text-lg font-bold">{profile.solved} Solved</p>
            {profile.rating && profile.rating > 0 && (
              <p className="text-sm text-gray-400">Rating: {profile.rating}</p>
            )}
          </>
        );
      case 'codeforces':
        return (
          <>
            <p className="text-sm text-gray-300 mb-2">@{profile.username}</p>
            <p className="text-lg font-bold">Rating: {profile.rating}</p>
            {profile.maxRating && profile.maxRating > 0 && (
              <p className="text-sm text-gray-400">Max: {profile.maxRating}</p>
            )}
          </>
        );
      case 'codechef':
        return (
          <>
            <p className="text-sm text-gray-300 mb-2">@{profile.username}</p>
            <p className="text-lg font-bold">Rating: {profile.rating}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold capitalize">{platform}</h3>
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <button
                onClick={() => onEdit(platform)}
                className="text-gray-400 hover:text-blue-400 transition"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onRemove(platform)}
                className="text-gray-400 hover:text-red-400 transition"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onConnect(platform)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Connect
            </button>
          )}
        </div>
      </div>
      {renderProfileDetails()}
    </div>
  );
}