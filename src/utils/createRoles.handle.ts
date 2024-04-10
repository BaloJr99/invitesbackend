import Role from '../models/role.js';

export const createRoles = async () => {
  try {
    const count = await Role.estimatedDocumentCount();

    if (count > 0) return;

    await Promise.all([
      new Role({ name: 'admin', isActive: true }).save(),
      new Role({ name: 'entriesAdmin', isActive: true }).save()
    ]);
  } catch (error) {
    console.error(error);
  }
}
