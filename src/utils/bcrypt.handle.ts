import bcryptjs from "bcryptjs";

const encryptPassword = async (password: string) => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(password, salt);
};

const comparePassword = async (password: string, receivedPassword: string) => {
  return await bcryptjs.compare(password, receivedPassword);
};

export { encryptPassword, comparePassword };