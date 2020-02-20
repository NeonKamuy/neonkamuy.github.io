/// Document onload
$(document).ready(function() {
  const scrollWidth = document.body.scrollWidth;

  $("a").on("click", function(event) {
    console.log(this.hash);
    if (this.hash !== "") {
      event.preventDefault();

      var hash = this.hash;
      $("html, body").animate(
        {
          scrollTop: $(hash).offset().top
        },
        800,
        function() {
          window.location.hash = hash;
        }
      );
    }
  });

  /// gallery
  $(".active-gallery-items").slick({
    arrows: false,
    dots: true,
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 1,
    mobileFirst: true,
    responsive: [
      {
        breakpoint: 767,
        settings: {
          centerMode: true,
          centerPadding: "0px",
          prevArrow: $(".arrow-left"),
          nextArrow: $(".arrow-right"),
          slidesToShow: 3,
          arrows: true,
          dots: true
        }
      }
    ]
  });

  //   ///  Main Slider
  // $(".active-slider-items").slick({
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   autoplay: true,
  //   autoplaySpeed: 5000,
  //   arrows: false,
  //   dots: false
  // });

  /// Popup
  const popup = document.getElementById("buy-online-popup");
  document.getElementById("buy-online").addEventListener("click", () => {
    popup.style.display = "block";
  });
  window.addEventListener("click", e => {
    if (e.target.id === "buy-online-popup") {
      popup.style.display = "none";
    }
  });

  const close_buttons = document.getElementsByClassName("close-popup");
  for (let i = 0; i != close_buttons.length; ++i) {
    close_buttons[i].addEventListener("click", () => {
      popup.style.display = "none";
    });
  }

  ///  Sticky header
  (() => {
    let headerStickHeight = 700;

    if (scrollWidth <= 767) {
      return;
    } else if (scrollWidth <= 1024) {
      headerStickHeight = 500;
    }

    const headerWrapper = document.getElementById("header-wrapper");
    const headerLogo = document.getElementById("header-logo");
    const header = document.getElementById("header");
    window.addEventListener("scroll", e => {
      if (window.pageYOffset >= headerStickHeight) {
        headerWrapper.className = "sticked";
        headerLogo.className = "sticked";
        header.className = "sticked";
      } else {
        headerWrapper.className = "";
        headerLogo.className = "";
        header.className = "";
      }
    });
  })();

  /// Dropdown menu
  const dropDown = document.getElementById("dropdown-menu");

  const dropDownHideListener = e => {
    if (e.target.id !== "dropdown-menu") {
      dropDown.style.display = "none";
    }
  };
  document.getElementById("nav-hamburger").addEventListener("click", e => {
    dropDown.style.display = "block";
  });

  window.addEventListener("click", dropDownHideListener);

  /// Geolocation
  initGeolocation();
});

let map = null;
let spb = [30.31413, 59.93863];
let msk = [37.61556, 55.75222];
function initGeolocation() {
  new Promise(mapsReady => ymaps.ready(mapsReady))
    .then(() => {
      map = new ymaps.Map(
        "map-widget",
        {
          center: [55.76, 37.64],
          zoom: 4,
          maxZoom: 15
        },
        { searchControlProvider: "yandex#search" }
      );
    })
    .then(() => getAddresses())
    .catch(e => console.error(e))
    .then(res => {
      placeMarks(res.moscow.concat(res.spb));
      locationButton = document.getElementById("use-current-location");
      locationButton.addEventListener("click", nearbyPlaces);
    });
}

let marks = null;
function placeMarks(addresses) {
  const geoObjects = [];
  const geoQuery = [];

  for (let i = 0; i != addresses.length; ++i) {
    const address = addresses[i];

    geoObjects.push(
      new ymaps.Placemark(
        [address.latitude, address.longitude],
        {
          hintContent: address.name,
          balloonContent: [
            `<div>Название: ${address.name}</div>`,
            `<div>Адрес: ${address.address}</div>`,
            `<div>Координаты: ${address.latitude}, ${address.longitude}</div>`
          ].join("")
        },
        {
          iconLayout: "default#image",
          iconImageHref: document.location.pathname + "res/images/mapicon.png",
          iconImageSize: [50, 50]
        }
      )
    );

    geoQuery.push({
      type: "Point",
      coordinates: [address.latitude, address.longitude]
    });
  }

  marks = ymaps.geoQuery(geoQuery);

  const clusterer = new ymaps.Clusterer({
    preset: "islands#redClusterIcons"
  });
  map.geoObjects.add(clusterer);
  clusterer.add(geoObjects);
}

function nearbyPlaces() {
  ymaps.geolocation.get().then(
    e => {
      console.log(e);
      console.log("Вычисляем местоположение");
      const coords = e.geoObjects.position;
      console.log("Координаты:", coords);

      const closest = marks.getClosestTo(coords).geometry.getBounds()[0];
      console.log("Ближайшая точка: ", closest);

      map.action.execute(
        new ymaps.map.action.Single({
          center: closest,
          zoom: 15,
          duration: 500,
          timingFunction: "ease-in"
        })
      );
    },
    () => {
      alert("Похоже, что вы заблокировали геолокацию для этой страницы");
    }
  );
}

function getAddresses() {
  return new Promise((resolve, reject) => {
    const XHR = new XMLHttpRequest();
    XHR.open("GET", document.location.pathname + "res/json/addresses.json");
    XHR.send();
    XHR.onreadystatechange = () => {
      if (XHR.readyState === XHR.DONE && XHR.status === 200) {
        if (XHR.status === 200) {
          const addresses = JSON.parse(XHR.responseText);
          resolve(addresses);
        } else {
          reject(new Error("Internal server error"));
        }
      }
    };
  });
}
