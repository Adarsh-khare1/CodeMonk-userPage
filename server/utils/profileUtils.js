const PLATFORMS = ['leetcode', 'codeforces', 'codechef'];

export const validatePlatform = (platform) => {
  return PLATFORMS.includes(platform);
};

export const getDefaultProfile = (platform) => {
  switch (platform) {
    case 'leetcode':
      return { username: '', solved: 0, rating: 0 };
    case 'codeforces':
      return { username: '', rating: 0, maxRating: 0 };
    case 'codechef':
      return { username: '', rating: 0 };
    default:
      return {};
  }
};

export const validateProfileData = (platform, profile) => {
  const validatedProfile = {};
  if (profile.username !== undefined) {
    validatedProfile.username = String(profile.username).trim();
  }

  switch (platform) {
    case 'leetcode':
      if (profile.solved !== undefined) validatedProfile.solved = Math.max(0, parseInt(profile.solved) || 0);
      if (profile.rating !== undefined) validatedProfile.rating = Math.max(0, parseInt(profile.rating) || 0);
      break;
    case 'codeforces':
      if (profile.rating !== undefined) validatedProfile.rating = Math.max(0, parseInt(profile.rating) || 0);
      if (profile.maxRating !== undefined) validatedProfile.maxRating = Math.max(0, parseInt(profile.maxRating) || 0);
      break;
    case 'codechef':
      if (profile.rating !== undefined) validatedProfile.rating = Math.max(0, parseInt(profile.rating) || 0);
      break;
  }

  return validatedProfile;
};