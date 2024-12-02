var slideIndex = 1;
	showSlides(slideIndex);


	function plusSlides(n) {
  		showSlides(slideIndex += n);
	}

	function currentSlide(n) {
	  showSlides(slideIndex = n);
	}

	function showSlides(n) {
		$(".banner_desc").addClass("off");
		$(".banner_page .page").addClass("off");
 		var i,
  			slides = document.getElementsByClassName("wrap_img"),
  			dots = document.getElementsByClassName("banner_desc"),
  			page = document.getElementsByClassName("page"),
  			captionText = document.getElementById("caption");

 		var slideLength = slides.length;
		if (n > slideLength) {slideIndex = 1}
		if (n < 1) {slideIndex = slideLength}

		if (slideLength > 0) {
			for (i = 0; i < slides.length; i++) {
				slides[i].style.display = "none";
			}
			slides[slideIndex-1].style.display = "block";
		}

		if (dots.length > 0) {
			for (i = 0; i < dots.length; i++) {
				dots[i].className = dots[i].className.replace(" active", "");
			}
			dots[slideIndex-1].className += " active";
		}

		if (page.length > 0) {
			for (i = 0; i < page.length; i++) {
				page[i].className = page[i].className.replace(" on", "");
			}
			page[slideIndex-1].className += " on";
		}

	}