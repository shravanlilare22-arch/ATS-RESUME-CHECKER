
// ==========================================
// PROFILE PHOTO STORAGE
// Uses the same storage key as ProfilePage.jsx
// ==========================================

// Generate storage key using user's email
const getStorageKey = (email) => {
  if (!email) return null;

  return `profileDetails:${email.trim().toLowerCase()}`;
};


// ==========================================
// GET PROFILE PHOTO
// ==========================================

export const getProfilePhoto = (email) => {
  try {
    const key = getStorageKey(email);

    if (!key) return null;

    const savedData = localStorage.getItem(key);

    if (!savedData) return null;

    const profileDetails = JSON.parse(savedData);

    return profileDetails.photo || null;

  } catch (error) {
    console.error("Error getting profile photo:", error);
    return null;
  }
};


// ==========================================
// SAVE PROFILE PHOTO
// ==========================================

export const saveProfilePhoto = (email, photo) => {
  try {
    const key = getStorageKey(email);

    if (!key || !photo) return false;

    // Keep existing profile details safe
    const existingData = JSON.parse(
      localStorage.getItem(key) || "{}"
    );

    existingData.photo = photo;

    localStorage.setItem(
      key,
      JSON.stringify(existingData)
    );

    console.log("Profile photo saved successfully!");

    return true;

  } catch (error) {
    console.error("Error saving profile photo:", error);
    return false;
  }
};


// ==========================================
// REMOVE PROFILE PHOTO
// ==========================================

export const removeProfilePhoto = (email) => {
  try {
    const key = getStorageKey(email);

    if (!key) return false;

    const existingData = JSON.parse(
      localStorage.getItem(key) || "{}"
    );

    delete existingData.photo;

    localStorage.setItem(
      key,
      JSON.stringify(existingData)
    );

    return true;

  } catch (error) {
    console.error("Error removing profile photo:", error);
    return false;
  }
};
