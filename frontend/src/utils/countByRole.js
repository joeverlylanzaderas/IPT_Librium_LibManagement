export const countByRole = (users = []) => {
  const counts = { admin: 0, librarian: 0, member: 0 };
  for (const u of users) {
    if (u?.role && counts[u.role] !== undefined) counts[u.role] += 1;
  }
  return counts;
};

