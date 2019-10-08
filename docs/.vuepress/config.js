const autobar = require("./plugins/autobar");

module.exports = ctx => ({
  title: "Happy Coding",
  description: "苦海无涯,学无止境",
  port: 83,
  plugins: [ [autobar, {pinyinNav: false}] ],
  themeConfig: {}
});
