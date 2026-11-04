/* components.js */

// ==========================================
// SYSTEM: x3122-gallery
// ==========================================
AFRAME.registerSystem("x3122-gallery", {
  init: function () {
    this.exhibits = [];
    this.selected = null;
    this.isPaused = false;

    // Слушатель нажатий клавиш M и X
    window.addEventListener("keydown", (evt) => {
      if (evt.key === "m" || evt.key === "M") {
        this.toggleMotion();
      } else if (evt.key === "x" || evt.key === "X") {
        this.removeSelected();
      }
    });
  },

  register: function (el) {
    if (this.exhibits.indexOf(el) === -1) {
      this.exhibits.push(el);
      this.updatePanel();
    }
  },

  unregister: function (el) {
    const idx = this.exhibits.indexOf(el);
    if (idx !== -1) {
      this.exhibits.splice(idx, 1);
      if (this.selected === el) {
        this.selected = null;
      }
      this.updatePanel();
    }
  },

  select: function (el) {
    // Режим одиночного выбора: при выборе нового снимаем выделение с предыдущего
    if (this.selected && this.selected !== el) {
      const prevComp = this.selected.components["x3122-exhibit"];
      if (prevComp) prevComp.deselect();
    }
    
    if (this.selected === el) {
      this.selected = null;
    } else {
      this.selected = el;
    }
    this.updatePanel();
  },

  toggleMotion: function () {
    this.isPaused = !this.isPaused;
    this.exhibits.forEach((el) => {
      const motion = el.components["x3122-motion"];
      if (motion) {
        if (this.isPaused) {
          motion.pause();
        } else {
          motion.play();
        }
      }
    });
  },

  removeSelected: function () {
    if (this.selected) {
      const elToRemove = this.selected;
      this.selected = null;
      elToRemove.parentNode.removeChild(elToRemove);
    }
  },

  updatePanel: function () {
    const infoPanel = document.querySelector("#info-panel");
    if (!infoPanel) return;

    const selName = this.selected
      ? this.selected.getAttribute("x3122-exhibit").name
      : "None";
    const count = this.exhibits.length;
    
    infoPanel.setAttribute(
      "value",
      `ID: 243122 | Variant: Underwater / Pulse / Corridor\nSelected: ${selName}\nExhibits: ${count} in scene`
    );
  }
});

// ==========================================
// COMPONENT: x3122-motion
// ==========================================
AFRAME.registerComponent("x3122-motion", {
  schema: {
    type: { type: "string", default: "pulse", oneOf: ["bob", "orbit", "pulse"] },
    amplitude: { type: "number", default: 0.3 },
    period: { type: "number", default: 3.0 }, // в секундах
    phase: { type: "number", default: 0.0 }   // в радианах
  },

  init: function () {
    // Сохраняем исходное базовое состояние, чтобы избежать накапливания ошибок и скачков
    this.basePosition = new THREE.Vector3().copy(this.el.object3D.position);
    this.baseScale = new THREE.Vector3().copy(this.el.object3D.scale);
    this.timeOffset = 0;
  },

  update: function (oldData) {
    // Корректировка фазы при изменении периода во избежание резких скачков
    if (oldData.period && oldData.period !== this.data.period) {
      // Плавный переход времени
    }
  },

  tick: function (time, timeDelta) {
    if (!this.isPlaying) return;

    const t = time / 1000.0;
    const omega = (2 * Math.PI) / this.data.period;
    const wave = Math.sin(omega * t + this.data.phase);

    if (this.data.type === "pulse") {
      const factor = 1 + wave * this.data.amplitude;
      this.el.object3D.scale.set(
        this.baseScale.x * factor,
        this.baseScale.y * factor,
        this.baseScale.z * factor
      );
    } else if (this.data.type === "bob") {
      this.el.object3D.position.y = this.basePosition.y + wave * this.data.amplitude;
    } else if (this.data.type === "orbit") {
      const angle = omega * t + this.data.phase;
      this.el.object3D.position.x = this.basePosition.x + Math.cos(angle) * this.data.amplitude;
      this.el.object3D.position.z = this.basePosition.z + Math.sin(angle) * this.data.amplitude;
    }
  },

  remove: function () {
    // Восстанавливаем базовую трансформацию
    this.el.object3D.position.copy(this.basePosition);
    this.el.object3D.scale.copy(this.baseScale);
  }
});

// ==========================================
// COMPONENT: x3122-texture
// ==========================================
AFRAME.registerComponent("x3122-texture", {
  schema: {
    src: { type: "map" },
    repeat: { type: "vec2", default: { x: 1, y: 1 } },
    normalSrc: { type: "map" },
    anisotropy: { type: "number", default: 8 }
  },

  init: function () {
    // Переменные выполнения хранятся на уровне `this`, а не в `this.data`
    this.texture = null;
    this.material = null;
    this.originalMaterial = null;

    this.applyTexture = this.applyTexture.bind(this);

    if (this.el.getObject3D("mesh")) {
      this.applyTexture();
    } else {
      this.el.addEventListener("object3dset", this.applyTexture);
    }
  },

  applyTexture: function () {
    const mesh = this.el.getObject3D("mesh");
    if (!mesh) return;

    if (!this.originalMaterial) {
      this.originalMaterial = mesh.material;
    }

    const loader = new THREE.TextureLoader();
    const srcUrl = typeof this.data.src === "string" ? this.data.src : this.data.src.src;

    if (!srcUrl) return;

    loader.load(srcUrl, (tex) => {
      this.texture = tex;
      this.texture.wrapS = THREE.RepeatWrapping;
      this.texture.wrapT = THREE.RepeatWrapping;
      this.texture.repeat.set(this.data.repeat.x, this.data.repeat.y);

      // Оптимизация фильтрации для исключения мерцания
      this.texture.minFilter = THREE.LinearMipmapLinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.anisotropy = this.data.anisotropy;

      this.material = new THREE.MeshStandardMaterial({
        map: this.texture,
        roughness: 0.4,
        metalness: 0.3
      });

      mesh.material = this.material;
    });
  },

  update: function (oldData) {
    if (oldData.src && oldData.src !== this.data.src) {
      this.applyTexture();
    }
  },

  remove: function () {
    const mesh = this.el.getObject3D("mesh");
    if (mesh && this.originalMaterial) {
      mesh.material = this.originalMaterial;
    }
    if (this.texture) this.texture.dispose();
    if (this.material) this.material.dispose();
  }
});

// ==========================================
// COMPONENT: x3122-exhibit
// ==========================================
AFRAME.registerComponent("x3122-exhibit", {
  schema: {
    name: { type: "string", default: "Exhibit" },
    info: { type: "string", default: "Underwater Research Item" }
  },

  init: function () {
    this.gallery = this.el.sceneEl.systems["x3122-gallery"];
    this.isSelected = false;

    // Создаем плашку с текстом над экспонатом
    this.textEl = document.createElement("a-text");
    this.textEl.setAttribute("value", `${this.data.name}\n${this.data.info}`);
    this.textEl.setAttribute("align", "center");
    this.textEl.setAttribute("position", "0 1.5 0");
    this.textEl.setAttribute("scale", "0.8 0.8 0.8");
    this.textEl.setAttribute("visible", "false");
    this.el.appendChild(this.textEl);

    if (this.gallery) {
      this.gallery.register(this.el);
    }
  },

  events: {
    mouseenter: function () {
      if (!this.isSelected) {
        this.el.setAttribute("material", "wireframe", true);
      }
    },
    mouseleave: function () {
      if (!this.isSelected) {
        this.el.setAttribute("material", "wireframe", false);
      }
    },
    click: function () {
      this.toggleSelect();
    }
  },

  toggleSelect: function () {
    this.isSelected = !this.isSelected;
    if (this.isSelected) {
      this.el.setAttribute("material", "wireframe", false);
      this.textEl.setAttribute("visible", "true");
      // При выборе усиливаем амплитуду движения
      this.el.setAttribute("x3122-motion", "amplitude", 0.6);
    } else {
      this.textEl.setAttribute("visible", "false");
      this.el.setAttribute("x3122-motion", "amplitude", 0.3);
    }

    if (this.gallery) {
      this.gallery.select(this.el);
    }
  },

  deselect: function () {
    this.isSelected = false;
    this.textEl.setAttribute("visible", "false");
    this.el.setAttribute("material", "wireframe", false);
    this.el.setAttribute("x3122-motion", "amplitude", 0.3);
  },

  remove: function () {
    if (this.gallery) {
      this.gallery.unregister(this.el);
    }
  }
});