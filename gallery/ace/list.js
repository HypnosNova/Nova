var list = {
  "Beginner": {
    "tutorial": [
      ["空的框架", "1.empty_framework"],
      ["添加立方体", "2.add_a_box"],
      ["逻辑循环", "3.logic_loop"],
      ["事件", "4.event"],
    ]
  },
  "Framework Core": {
    "app": [
      ["Empty framework", "1.empty_framework"],
      ["Add a box", "2.add_a_box"],
    ],
    "loop": [
      ["Logic loop", "3.logic_loop"],
    ],
    "events": [
      ["Tap event", "4.event"],
    ],
    "transition": [
      ["Transitionor", "5.transition"],
    ],
    "VR": [
      ["Normal VR", "6.vr"],
    ]
  },
  "Others": {
    "Shader": [
      ["Nova", "999.nova"]
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