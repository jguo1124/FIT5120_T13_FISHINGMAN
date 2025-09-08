// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  transform: {},                 // 源码是 ESM，不做 transform
  testMatch: ["**/tests/**/*.js"]// 或者精确到你的单测文件
};
