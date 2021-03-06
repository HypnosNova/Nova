const list = {
	"Framework Core": {
		"app": [
			["Empty framework", "1.empty_framework"],
			["Add a box", "2.add_a_box"],
			["Screenshot", "7.screenshot"],
			["Toggle fullscreen", "15.fullscreen"],
			["Bind value", "20.bind"],
			["Bind uniform", "33.bind_uniform"],
			["Bind more values", "21.bind_advance"],
			["Coordinate transform", "34.coordinate_transform"],
			["Video uv", "23.video_uv"],
		],
		"loader": [
			["Load obj & mtl", "11.add_model"],
			["Loding progress", "12.loading_effect"],
			["Model clip", "24.model_clip"],
		],
		"loop": [
			["Logic loop", "3.logic_loop"],
			["Particle global cities", "28.particle_global_cities"]
		],
		"fbo": [
			["Render to texture", "35.fbo_world"],
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
			["Draw on a cube", "13.pen"],
			["Virtual event", "26.particle_event"],
			["FBO world event", "37.fbo_world_events"],
			["FBO event face mapping", "38.fbo_events_face_mapping"]
		],
		"Hammer": [
			["Swipe event", "14.swipe"],
			["Tap event", "4.event"]
		]
	},
	"Postprocessing": {
		"Normal": [
			["Afterimage effect", "29.afterimage_effect"],
			["Dot effect", "16.dot_effect"],
			["FXAA effect", "18.fxaa_effect"],
			["Glitch effect", "17.glitch_effect"],
			["Outline effect", "19.outline_effect"],
			["Watercolor effect", "31.watercolor_effect"]
		]
	},
	"Plugins": {
		"Bas": [
			["Particles moving", "10.particles_move"],
			["Picture sandglass", "27.picture_sandglass"]
		],
		"Others": [
			["Selection box", "32.selection_box"],
			["Screenshot", "36.screenshot"]
		]
	},
	"Others": {
		"Shader": [
			["Chinese paint", "996.chinese_paint"],
			["Electric", "30.electric"],
			["Halloween clock", "997.halloween_clock"],
			["Nova", "999.nova"]
		],
		"Others": [
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