var carouselController = {
  low: -1,
  high: 1,
  data: [],

  getLen() {
    return this.data.length
  }, 

  // Carousel has a circular structure. We work with negative indexes
  // to easen index arithmetic. eg: -1 === last element.
  // This function converts back to the real index if i<0.
  convertIndex(i) {
    return i < 0 ? this.data.length + i : i
  },

  getIndexList() {
    var indexes = []

    for (i = this.low; i <= this.high; i++) {
      indexes.push(this.convertIndex(i))
    }

    return indexes
    // return indexes.sort()
  },

  insertImageIntoCarousel(image, i, operation, active='') {
    var carousel = $("#carousel .carousel-inner")

    var carouselItem = `
        <div class="carousel-item ${active}">
          <img class="d-block w-100" src="${image.img_src}" alt="First slide">
          <div class="carousel-caption d-none d-md-block">
              <h5 class="carousel-text" >${image.rover.name}</h5>
              <br>
              <p class="carousel-text">${image.earth_date}</p>
              <br>
              <p class="carousel-text">${i}</p>
            </div>
        </div>
    `

    carousel[operation](carouselItem)
  },

  initCarousel(data) {
    this.low = -1
    this.high = 1
    this.data = data.photos

    if (!this.data || this.data.length === 0) {
      alert("Erro: Nenhuma imagem encontrada")
      return
    }

    $(".carousel-inner").children().remove()
    this.getIndexList().forEach( i => {
      var photo = this.data[i]
      var active = i === 0 ? 'active' : ''
      if (photo)
        this.insertImageIntoCarousel(photo, i, 'append', active)
    })

    var carousel = $("#carousel")
    carousel.carousel()
    carousel.show()
  },

  onSlideHandler(e) {
    if (this.getLen() <= (this.high - this.low + 1))
      return
    if (e.direction === 'left') {
      this.low = (this.low + 1) % this.getLen()
      this.high = (this.high + 1) % this.getLen()

      console.log(`img window: [${this.low}, ${this.high}]`)

      var carouselInner = $(".carousel-inner")
      carouselInner.children(":first-child").remove()

      var index = this.convertIndex(this.high)
      this.insertImageIntoCarousel(this.data[index], index, 'append')
    } else if (e.direction === 'right') {
      this.low = (this.low - 1) % this.getLen()
      this.high = (this.high - 1) % this.getLen()

      // deal with negative zero
      this.low = this.low === 0 ? 0 : this.low
      this.high = this.high === 0 ? 0 : this.high

      console.log(`img window: [${this.low}, ${this.high}]`)

      var carouselInner = $(".carousel-inner")
      carouselInner.children(":last-child").remove()

      var index = this.convertIndex(this.low)
      this.insertImageIntoCarousel(this.data[index], index, 'prepend')
    }
  }
}

function nasaApiUrl(sol) {
  return `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=MrfBZ9661U9AdWtFle3BvcuIdWBcwcOexiRa6zFw`
}

function fetchImageData(sol) {
  fetch(nasaApiUrl(sol))
    .then(response => response.json())
    .then(data => {
      carouselController.initCarousel(data)
    })
    .catch( e => console.log(e))
}

$( document ).ready( function () {
  $( "#google-form" ).submit(function( event ) {
    event.preventDefault();

    var data = $("#google-form :input").serializeArray();
    window.open(`https://www.google.com/search?q=${encodeURI(data[0].value)}`)
  });

  $( "#sol-form" ).submit(function( event ) {
    event.preventDefault();


    var sol = $("#sol-form :input").serializeArray()[0].value;
    fetchImageData(sol)
  });

  var carousel = $("#carousel")
  carousel.hide()
  carousel.on('slid.bs.carousel', function(e) { carouselController.onSlideHandler(e) })

  fetchImageData(1000)
})