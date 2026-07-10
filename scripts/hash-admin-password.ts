import {hashPassword} from "../lib/auth/password";

const password = process.argv[2] || process.env.ADMIN_PASSWORD;
if (!password) {
  console.error("用法：npm run auth:hash -- '至少12位的强密码'");
  process.exit(1);
}
console.log(hashPassword(password));
