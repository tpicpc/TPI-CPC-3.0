// Feature flags. Flip a flag to true to re-enable the feature; no code or data is deleted.
export const FEATURES = {
  // Public Projects showcase (/projects, /projects/[id], /submit-project) and its links.
  projects: false,
  gallery: true,
  // Public leaderboard (/leaderboard) and its nav/sitemap links. Admin management stays available.
  leaderboard: false,
};

export const isEnabled = (name) => FEATURES[name] === true;
