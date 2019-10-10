const autobar = require("./plugins/autobar");

module.exports = ctx => ({
  title: "Happy Coding",
  description: "学无止境...",
  port: 83,
  dest: './documents',
  base: '/Blog/',
  plugins: [ [autobar, {pinyinNav: false}] ],
  themeConfig: {}
});
