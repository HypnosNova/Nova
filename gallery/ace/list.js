const list = {
  "Framework Core": {
    "app": [
      ["Empty framework", "1.empty_framework"],
      ["Add a box", "2.add_a_box"],
      ["Screenshot", "7.screenshot"],
      ["Toggle fullscreen", "15.fullscreen"],
      ["Bind value", "20.bind"],
      ["Bind more values", "21.bind_advance"],
      ["Video uv", "23.video_uv"],
    ],
    "loader": [
      ["Load obj & mtl", "11.add_model"],
      ["Loding progress", "12.loading_effect"],
      ["Model clip", "24.model_clip"],
    ],
    "loop": [
      ["Logic loop", "3.logic_loop"],
    ],
    "transition": [
      ["Transitionor", "5.transition"],
    ],
    "Views": [
      ["Multiple views", "8.views"],
      ["Multiple monitors", "9.monitors"]
    ],
    "VR": [
      ["Normal VR", "6.vr"],
    ]
  },
  "Event": {
    "Normal": [
      ["Draw on a cube", "13.pen"]
    ],
    "Hammer": [
      ["Tap event", "4.event"],
      ["Swipe event", "14.swipe"]
    ]
  },
  "Postprocessing": {
    "Normal": [
      ["Dot effect", "16.dot_effect"],
      ["Glitch effect", "17.glitch_effect"],
      ["FXAA effect", "18.fxaa_effect"],
      ["Outline effect", "19.outline_effect"]
    ]
  },
  "BAS": {
    "Animation": [
      ["Particles moving", "10.particles_move"]
    ]
  },
  "Others": {
    "Shader": [
      ["Nova", "999.nova"],
      ["Halloween clock", "997.halloween_clock"]
    ],
    "Other": [
      ["Noise flower", "25.flower"],
      ["Periodic table", "998.periodic_table"]
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