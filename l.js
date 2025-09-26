particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 10, 
      "density": {
        "enable": true,
        "value_area": 1000,
        
      }
    },
    "color": {
      "value": "#6e1f00" 
    },
    "shape": {
      "type": "circle",
    },
    "opacity": {
      "value": 0.6,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 1,
        "opacity_min": 0.0,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
      }
    },
    "line_linked": {
      "enable": false,
    },
    "move": {
      "enable": true,
      "speed": 10,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "repulse" 
      },
      "onclick": {
        "enable": true,
        "mode": "push" 
      },
      "resize": true
    },
    "modes": {
      "repulse": {
        "distance": 100,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 100
      },
    }
  },
  "retina_detect": true
});