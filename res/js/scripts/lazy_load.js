class MY_LazyLoader {
    static loadCSS(refs) {
      const parent = document.getElementById("styles");
      for (const ref of refs) {
        const element = document.createElement("link");
        element.href = ref;
        element.rel = "stylesheet";
        element.type = "text/css";
        parent.appendChild(element);
      }
    }

    static _refs = [
      "./res/css/lazy.bundle.css",
      "./res/css/styles/video-js.min.css"
    ];
  }
  
  MY_LazyLoader.loadCSS(MY_LazyLoader._refs);