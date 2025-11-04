export const activeUsers = new Set<number>();

export function addActiveUser(id: number) {
  activeUsers.add(id);
}

export function removeActiveUser(id: number) {
  activeUsers.delete(id);
}

export default { activeUsers, addActiveUser, removeActiveUser };
