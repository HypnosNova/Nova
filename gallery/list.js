var list = {
  "beginner": {
    "tutorial": [
      ["empty", "framework/emptyFramework"],
      ["add cube", "framework/002在指定的div里渲染"],
    ]
  },
  "about framework": {
    "app": [
      ["empty", "framework/emptyFramework"],
      ["add cube", "framework/addABox"],
    ],
    "events": [
      ["万圣节效果的时间特效", "shader/clock"],
      ["新星", "shader/nova"],
    ]
  },
  "events": {
    "主要部分是着色器": [
      ["万圣节效果的时间特效", "shader/clock"],
      ["新星", "shader/nova"],
    ]
  }
};

var pages = {};

for (var section in list) {

  pages[section] = {};

  for (var category in list[section]) {

    pages[section][category] = {};

    for (var i = 0; i < list[section][category].length; i++) {

      var page = list[section][category][i];
      pages[section][category][page[0]] = page[1];

    }

  }

}