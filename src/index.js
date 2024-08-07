// Importing NPM packages
import Lenis from "lenis";
import tippy from "tippy.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import Swiper from "swiper";
import "swiper/css";

// Two custom events for smoothScroll() function
const eventDisableScroll = new Event("disable-scroll");
const eventEnableScroll = new Event("enable-scroll");

// Function to disable scroll
function disableScroll() {
	if (lenis) {
		lenis.stop();
	} else {
	}
}

// Function to enable scroll
function enableScroll() {
	lenis.start();
}

// Event listeners for custom events triggered when menu opens/closes
document.addEventListener("disable-scroll", disableScroll);
document.addEventListener("enable-scroll", enableScroll);

// Lenis smooth scroll function
let lenis;
const smoothScroll = function () {
	if (Webflow.env("editor") === undefined) {
		lenis = new Lenis({
			lerp: 0.1,
			touchMultiplier: 1.5,
			easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
		});

		lenis.on("scroll", ScrollTrigger.update);

		gsap.ticker.add((time) => {
			lenis.raf(time * 1000);
		});

		gsap.ticker.lagSmoothing(0);
	}
};

const menuAnimation = function () {
	const menuTrigger = document.querySelectorAll(".header_hamburger, .nav_hamburger, .header_hamburger-text");
	const navMenu = document.querySelector(".nav");
	if (!menuTrigger || !navMenu) return;
	const navWrap = document.querySelector(".nav_wrap, .transparent-nav_wrap");
	const homeHeaderLogo = document.querySelector(".header_logo.is-home");
	const navLinks = document.querySelectorAll(".nav_link");

	gsap.set(navMenu, {
		visibility: "hidden",
	});

	gsap.set(navWrap, {
		y: "100%",
	});

	function calcParentHeight() {
		navMenu.style.height = `${navWrap.offsetHeight}px`;
	}

	calcParentHeight();

	// Adjust parent height when wndow is resized to match navWrap
	window.addEventListener("resize", calcParentHeight);

	const menuTl = gsap.timeline({ paused: true });
	const navLinksTl = gsap.timeline({ paused: true });

	menuTl
		.set(navMenu, {
			visibility: "visible",
		})
		.to(navMenu, {
			y: "0%",
			ease: "power2.inOut",
			duration: 0.8,
		})
		.to(
			navWrap,
			{
				y: "0%",
				ease: "power2.inOut",
				duration: 0.8,
			},
			"<"
		)
		.to(
			homeHeaderLogo,
			{
				opacity: 0,
				duration: 0.2,
			},
			0.25
		);

	navLinksTl.fromTo(
		navLinks,
		{
			y: "100%",
		},
		{
			y: "0%",
			stagger: 0.1,
			duration: 0.8,
			ease: "power2.inOut",
		},
		0.1
	);

	menuTrigger.forEach((btn) => {
		btn.addEventListener("click", (e) => {
			// Animate hamburger on Desktop
			const animatedButton = document.querySelectorAll(".animated-hamburger");
			if (animatedButton.length !== 0) {
				animatedButton.forEach((btn) => btn.classList.toggle("hamburger-open"));
			}

			navMenu.classList.toggle("menu-open");
			if (navMenu.classList.contains("menu-open")) {
				document.dispatchEvent(eventDisableScroll);
				menuTl.play();
				navLinksTl.restart();
			} else {
				document.dispatchEvent(eventEnableScroll);
				menuTl.reverse();
			}
		});
	});
};

const rotatingTextAnimation = function () {
	const rotatingTextWraps = document.querySelectorAll(".rotating-text_wrap");
	if (rotatingTextWraps.length === 0) return;
	let firstSplit;

	rotatingTextWraps.forEach((textWrap) => {
		const rotatingTexts = textWrap.querySelectorAll(".rotating-text_item");
		gsap.set(rotatingTexts, {
			opacity: 1,
		});

		let maxHeight = 0;

		const tl = gsap.timeline({ repeat: -1, repeatDelay: 0 });

		rotatingTexts.forEach((text, index) => {
			if (text.offsetHeight > maxHeight) {
				maxHeight = text.offsetHeight;
			}

			const splitText = new SplitType(text);

			// Animate out first
			if (index === 0) {
				// Store first split in variable so we can use as last
				firstSplit = splitText;

				tl.fromTo(
					splitText.lines,
					{
						y: "0px",
						opacity: 1,
					},
					{
						y: "20px",
						opacity: 0,
						duration: 0.8,
						stagger: -0.3,
						ease: "power3.in",
					},
					"+=1.5"
				);
			}

			if (index !== 0) {
				// Animate in
				tl.fromTo(
					splitText.lines,
					{
						opacity: 0,
						y: "20px",
					},
					{
						opacity: 1,
						y: "0px",
						duration: 0.8,
						stagger: 0.3,
						ease: "power3.out",
					},
					"+=0.1"
				);

				// Animate out
				tl.to(
					splitText.lines,
					{
						y: "20px",
						opacity: 0,
						duration: 0.8,
						stagger: -0.3,
						ease: "power3.in",
					},
					"+=1.5"
				);
			}
		});

		// Finally, at the end of the loop, animate in the first item
		tl.to(
			firstSplit.lines,
			{
				opacity: 1,
				y: "0px",
				duration: 0.8,
				stagger: 0.3,
				ease: "power3.out",
			},
			"+=0.1"
		);

		tl.play();

		textWrap.style.height = maxHeight + "px";
	});
};

const closedFundsListAnimation = function () {
	const funds = document.querySelectorAll(".funds-list_item");
	const track = document.querySelector(".funds-list_track");

	if (!track) return;

	// Animation options
	const prevEase = "power2.in";
	const currEase = "power2.out";
	const animationInterval = 32;
	const animationDuration = 1;

	// Setting height of the animation track, accordingly to how many funds there are
	if (window.innerWidth > 767) {
		track.style.height = `calc(100vh + ${animationInterval * funds.length}px)`;
	}

	// Setting value to fund counter dynamically
	const totalFunds = document.querySelectorAll(".funds-list_total");
	totalFunds.forEach((fund) => {
		fund.textContent = funds.length < 10 ? "0" + funds.length : funds.length;
	});

	let tlArr = [];
	let tlPlaying = false;

	const playTimelines = function () {
		if (tlArr.length > 0 && !tlPlaying) {
			document.dispatchEvent(eventDisableScroll);
			let nextTimeline = tlArr.shift(); // Get the next timeline
			tlPlaying = true;
			nextTimeline.restart();

			// Use onComplete to trigger the next timeline
			nextTimeline.eventCallback("onComplete", () => {
				document.dispatchEvent(eventEnableScroll);
				tlPlaying = false;
				playTimelines(); // Play the next timeline when the current one finishes
			});
		}
	};

	// Variable to track heighest heading grid value
	let maxGridHeight = 0;

	funds.forEach((fund, index) => {
		const currentTitle = fund.querySelector(".funds-list_heading");
		const currentTitleSplit = new SplitType(currentTitle, { types: "lines, words" });
		const currentInfo = fund.querySelectorAll(".funds-list_info-grid .funds-list_info-text");
		const currentImage = fund.querySelector(".funds-list_image");
		const currentNumber = fund.querySelector(".funds-list_current");
		const currentButton = fund.querySelector(".button");
		const fundHeadingGrid = fund.querySelector(".funds-list_heading-grid");

		// Get fund item heighest grid
		const currentFundGridHeight = fundHeadingGrid.offsetHeight;
		currentFundGridHeight > maxGridHeight ? (maxGridHeight = currentFundGridHeight) : null;

		// Current fund number
		currentNumber.textContent = index < 10 ? "0" + (index + 1) : index;

		// Disable animation on mobile
		if (window.innerWidth > 767) {
			// Changing z-index to reverse the list order, so first html element is visible on top
			let zIndex = index * -1;
			fund.style.zIndex = zIndex;
			if (index !== 0) {
				gsap.set([currentTitleSplit.words, currentInfo, currentNumber, currentButton, currentImage], { y: "100%" });
			}

			const tlDown = gsap.timeline({ paused: true });
			const tlUp = gsap.timeline({ paused: true });

			const masterTimeline = gsap.timeline({
				scrollTrigger: {
					trigger: ".funds-list_sticky-container",
					start: `top+=${index * animationInterval} top`,
					end: `top+=${(index + 1) * animationInterval} top`,
					markers: false,
					onEnter: () => {
						if (index !== 0) {
							tlArr.push(tlDown);
							playTimelines();
						}
					},
					onLeaveBack: () => {
						if (index !== 0) {
							tlArr.push(tlUp);
							playTimelines();
						}
					},
				},
			});

			// Animate OUT PREVIOUS
			if (index !== 0) {
				const prevInfo = funds[index - 1].querySelectorAll(".funds-list_info-grid .funds-list_info-text");
				const prevTitle = funds[index - 1].querySelector(".funds-list_heading");
				const prevTitleWords = prevTitle.querySelectorAll(".word");
				const prevImage = funds[index - 1].querySelector(".funds-list_image");
				const prevNumber = funds[index - 1].querySelector(".funds-list_current");
				const prevButton = funds[index - 1].querySelector(".button");

				// Scroll down animation
				tlDown
					.to(prevImage, {
						y: "-100%",
						ease: "power2.inOut",
						duration: 1,
					})
					.to(
						currentImage,
						{
							y: "0%",
							ease: "power2.inOut",
							duration: 1,
						},
						"<"
					)
					.to(
						[prevTitleWords, prevInfo, prevNumber, prevButton],
						{
							y: "-100%",
							ease: "power2.inOut",
							duration: 0.6,
						},
						"<"
					)
					.to(
						[currentTitleSplit.words, currentInfo, currentNumber, currentButton],
						{
							y: "0%",
							ease: "power2.inOut",
							duration: 0.6,
						},
						0.4
					);

				tlDown.set(fund, { zIndex: zIndex * -1 });

				// (SCROLLING UP) Animate out current
				tlUp
					.to(currentImage, {
						y: "100%",
						ease: "power2.inOut",
						duration: 1,
					})
					.to(
						prevImage,
						{
							y: "0%",
							ease: "power2.inOut",
							duration: 1,
						},
						"<"
					)
					.to(
						[currentTitleSplit.words, currentInfo, currentNumber, currentButton],
						{
							y: "100%",
							ease: "power2.inOut",
							duration: 0.6,
						},
						"<"
					)
					.to(
						[prevTitleWords, prevInfo, prevNumber, prevButton],
						{
							y: "0%",
							ease: "power2.inOut",
							duration: 0.6,
						},
						0.4
					);

				tlUp.set(fund, { zIndex: zIndex });
			}
		}
	});

	// Setting grid height to the heighest one
	if (window.innerWidth > 767) {
		const fundHeadingGrids = document.querySelectorAll(".funds-list_heading-grid");
		fundHeadingGrids.forEach((grid) => {
			grid.style.height = `${maxGridHeight}px`;
		});
	}
};

const closedFundsGalleryAnimation = function () {
	const imageList = document.querySelectorAll(".fund-images_item");
	if (imageList.length === 0) return;
	const lastImage = imageList[imageList.length - 1];
	const progressWrap = document.querySelector(".fund-images_progress-wrap");
	const zIndexStart = 30;
	const progressItemHTML = `<div class="fund-images_progress-bar"><div class="fund-images_progress-loader"></div></div>`;

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: ".section_fund-images",
			start: "top 10%",
			toggleActions: "play none none none",
		},
		repeat: -1,
	});

	// Initialize all progress bars to 0%
	imageList.forEach((image, index) => {
		const tempContainer = document.createElement("div");
		tempContainer.innerHTML = progressItemHTML;
		const progressItem = tempContainer.firstChild;
		progressWrap.appendChild(progressItem);
		const progressBar = progressItem.querySelector(".fund-images_progress-loader");
		gsap.set(progressBar, { width: "0%" }); // Initialize width to 0%
	});

	imageList.forEach((image, index) => {
		image.style.zIndex = zIndexStart - index;

		const progressBar = progressWrap.children[index].querySelector(".fund-images_progress-loader");

		// Animate out the previous image and in the current image
		if (index !== 0) {
			const prevImage = imageList[index - 1];

			tl.to(prevImage, { scale: 1.1, ease: "power1.in", duration: 0.3 })
				.to(prevImage, { x: "-130%", duration: 1, ease: "power2.in" })
				.to(progressBar, { width: "100%", duration: 5, ease: "linear" }, "<")
				.from(image, { scale: 1.3, duration: 5, ease: "power2.out" }, "<")
				.set(progressBar, { width: "0%" });

			if (index === 1) {
				tl.set(prevImage, { x: "0%", zIndex: zIndexStart - imageList.length, scale: 1.3 });
			}
		}
	});

	// Animate out the last image
	tl.to(lastImage, { scale: 1.1, ease: "power1.in", duration: 0.3 }).to(lastImage, { x: "-130%", duration: 1, ease: "power2.in" });

	// Animate in the first image and its progress bar for seamless loop
	const firstProgressBar = progressWrap.children[0].querySelector(".fund-images_progress-loader");
	tl.to(firstProgressBar, { width: "100%", duration: 5, ease: "linear" }, "<").to(imageList[0], { scale: 1, duration: 5, ease: "power2.out" }, "<");
};

const fundTooltip = function () {
	const fundInfoRows = document.querySelectorAll(".fund_info-row");
	fundInfoRows.forEach((row, index) => {
		const tooltipTarget = row.querySelector(".fund_tooltip");
		if (!tooltipTarget) return;
		const tooltipContent = row.querySelector(".fund_tooltip-content").textContent;
		const splitContent = tooltipContent.split(", ");

		const gridHtml = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
    ${splitContent.map((item, index) => `<div style="color: ${index % 2 === 0 ? "#808080" : "black"};">${item}</div>`).join("")}</div>`;

		tippy(tooltipTarget, {
			content: gridHtml,
			allowHTML: true,
			theme: "demus",
		});
	});
};

const contactFormLabels = function () {
	// Select all input fields within .form_field-wrap elements
	const inputFields = document.querySelectorAll(".form_field-wrap .form_input");

	const updateLabel = function (event) {
		const inputField = event.target;
		const inputParentWrap = inputField.closest(".form_field-wrap");
		const inputLabel = inputParentWrap.querySelector(".form_label");

		if (inputField.value) {
			inputLabel.style.opacity = 0.5;
		} else {
			inputLabel.style.opacity = 1;
		}
	};

	inputFields.forEach((inputField) => {
		inputField.addEventListener("change", updateLabel);
	});
};

const contactFormSelect = function () {
	const formSelectField = document.querySelector(".form_field-wrap .form_input.w-select");
	if (!formSelectField) return;

	formSelectField.addEventListener("change", function () {
		if (this.value) {
			this.style.color = "rgba(0, 0, 0, 1)";
		} else {
			this.style.color = "rgba(0, 0, 0, 0.5)";
		}
	});
};

const customFormValidation = function () {
	const $form = $("form");
	$.validator.addMethod("letters", function (value, element) {
		return this.optional(element) || /^[\p{L}\s]*$/u.test(value);
	});
	$.validator.addMethod("phone", function (value, element) {
		return this.optional(element) || /^[\d\s().+-]+$/.test(value);
	});

	$form.validate({
		rules: {
			name: {
				required: true,
				minlength: 3,
				letters: true,
			},
			email: {
				required: true,
				email: true,
			},
			phone: {
				required: true,
				minlength: 5,
				phone: true,
			},
			linkedin: {
				required: true,
				minlength: 3,
				letters: true,
			},
			message: {
				required: true,
				minlength: 3,
			},
		},
		messages: {
			name: "Nurodykite savo vardą",
			email: "Nurodykite savo el. paštą",
			phone: "Nurodykite savo tel. numerį",
			linkedin: "Nurodykite savo LinkedIn paskyrą",
			message: "Laukelis negali būti tuščias",
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") == "privacy-policy") {
				element.parent().addClass("form-checkbox-error");
			} else {
				error.insertAfter(element);
			}
		},
		success: function (label, element) {
			if (element.name == "privacy-policy") {
				$(element).parent().removeClass("form-checkbox-error");
			}
		},
		onfocusout: false, // Disable validation on focus out
		onkeyup: false, // Optionally disable validation on key up
	});
};

const postCategoryCount = function () {
	const categoriesArray = document.querySelectorAll(".news-list_label-wrap");
	if (categoriesArray.length === 0) return;
	const postArray = document.querySelectorAll(".post-categories");
	let matchCount;

	const postCounter = function (categoryTerm) {
		if (categoryTerm === "Visos naujienos") {
			return postArray.length;
		}
		matchCount = 0;
		postArray.forEach((post) => {
			const postTerm = post.textContent;
			if (postTerm === categoryTerm) {
				matchCount += 1;
			}
		});

		return matchCount;
	};

	categoriesArray.forEach((category) => {
		const counterElement = category.querySelector(".news-list_filter-count");
		const categoryTerm = category.querySelector('[fs-cmsfilter-field="category"]').textContent;

		counterElement.textContent = `(${postCounter(categoryTerm)})`;
	});
};

const newsAnchorScroll = function () {
	const anchorTarget = document.getElementById("news-anchor");
	if (!anchorTarget) return;
	const anchorTrigger = document.querySelectorAll(".news-list_filter-text, .news-list_nav-btn, .w-pagination-previous.news-list_nav-btn");
	anchorTrigger.forEach((trigger) => {
		trigger.addEventListener("click", function () {
			setTimeout(() => {
				anchorTarget.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 400);
		});
	});
};

const footerRevealAnimation = function () {
	// Select the footer element
	const footerOuterWrap = document.querySelector(".footer_outer-wrap");
	if (!footerOuterWrap) return;

	function setupFooterTrigger() {
		ScrollTrigger.refresh();
		// Variables for fixed footer animation
		const fixedFooterWrap = document.querySelector(".footer_fixed-wrap");
		const fixedFooterHeight = fixedFooterWrap.getBoundingClientRect().height;
		const viewportHeight = window.innerHeight;
		let footerTrigger;
		let isFooterHeigher;
		// Setting footer outerWrap to match fixed footer height
		footerOuterWrap.style.height = fixedFooterHeight + "px";

		// Set pin position depending on footer height
		if (fixedFooterHeight >= viewportHeight) {
			isFooterHeigher = true;
			fixedFooterWrap.classList.add("fixed-top");
		} else {
			isFooterHeigher = false;
			fixedFooterWrap.classList.add("fixed-bottom");
		}

		// Create a new ScrollTrigger with updated    settings
		footerTrigger = ScrollTrigger.create({
			trigger: footerOuterWrap,
			start: "top top",
			onEnter: () => {
				isFooterHeigher ? fixedFooterWrap.classList.remove("fixed-top") : fixedFooterWrap.classList.remove("fixed-bottom");
			},
			onLeaveBack: () => {
				isFooterHeigher ? fixedFooterWrap.classList.add("fixed-top") : fixedFooterWrap.classList.add("fixed-bottom");
			},
		});
	}

	setupFooterTrigger();

	const layoutShiftButtons = document.querySelectorAll(".news-list_filter-text, .news-list_nav-btn, .form_submit-button, .faq_item");
	if (layoutShiftButtons.length !== 0) {
		layoutShiftButtons.forEach((button) => {
			button.addEventListener("click", () => setTimeout(setupFooterTrigger, 300));
		});
	}
};

const aboutLinkBlockHoverAnimation = function () {
	const animationTriggers = document.querySelectorAll(".about-links_link-wrap, .laws-list_link-wrap");
	const dividers = document.querySelectorAll(".about-links_divider");
	animationTriggers.forEach((trigger) => {
		trigger.addEventListener("mouseenter", function () {
			// Set all elements except hovered to gray
			animationTriggers.forEach((el) => {
				if (el !== this) {
					el.style.color = "#808080";
				}
			});

			// If divider exists set all to gray
			if (dividers.length > 0) {
				dividers.forEach((divider) => {
					divider.style.backgroundColor = "#808080";
				});
			}
		});

		trigger.addEventListener("mouseleave", function () {
			animationTriggers.forEach((el) => {
				el.style.color = "";
			});

			if (dividers.length > 0) {
				dividers.forEach((divider) => {
					divider.style.backgroundColor = "";
				});
			}
		});
	});
};

const formSuccessWrapHeight = function () {
	const form = document.querySelector(".form_wrap");
	if (!form) return;

	const formHeight = form.offsetHeight;
	const successWrap = document.querySelector(".form_success-text-wrap");
	successWrap.style.minHeight = formHeight + "px";
};

const imageParallaxAnimation = function () {
	const parallaxWrap = document.querySelectorAll(".parallax_wrap");
	if (!parallaxWrap) return;

	parallaxWrap.forEach((wrap) => {
		const parallaxImage = wrap.querySelector(".parallax_image");
		gsap.to(parallaxImage, {
			scrollTrigger: {
				trigger: wrap,
				start: "top bottom",
				end: "bottom top",
				scrub: true,
			},
			top: "0%",
			ease: "none",
		});
	});
};

const stickyHamburger = function () {
	const stickyHamburgers = document.querySelectorAll(".header_hamburger:not(.not-sticky)");

	if (!stickyHamburger.length === 0) return;
	let btnOffsetTop;
	window.innerWidth > 767 ? (btnOffsetTop = "32px") : (btnOffsetTop = "20px");

	stickyHamburgers.forEach((hamburger) => {
		ScrollTrigger.create({
			trigger: hamburger,
			start: `top ${btnOffsetTop}px`,
			endTrigger: "html",
			end: "bottom top",
			pin: true,
			pinSpacing: false,
		});
	});
};

const cookieAllowScroll = function () {
	setTimeout(function () {
		const openCookieModal = document.querySelector(".cky-modal");
		if (openCookieModal) {
			openCookieModal.setAttribute("data-lenis-prevent", "");
		}
	}, 500);
};

const careerListEmptyHeading = function () {
	const careerSection = document.querySelector(".section_career-list");
	if (!careerSection) return;

	const defaultHeading = careerSection.querySelector(".career-list_h2");
	// If there is empty state then hide default section heading
	careerSection.querySelector(".w-dyn-empty") ? (defaultHeading.style.display = "none") : null;
};

const hideHamburgerOnFooter = function () {
	// Variables and timeline for hamburger hide/show
	const footer = document.querySelector(".footer_outer-wrap");
	const hamburger = document.querySelectorAll(".header_hamburger");

	if (!footer || !hamburger) return;

	const hideHamburgerTl = gsap.timeline({ paused: true });
	hideHamburgerTl.to(hamburger, { opacity: 0, duration: 0.3 }).set(hamburger, { display: "none" });

	ScrollTrigger.create({
		trigger: footer,
		start: "top 20%",
		onEnter: () => {
			hideHamburgerTl.play();
		},
		onLeaveBack: () => {
			hideHamburgerTl.reverse();
		},
	});
};

const hamburgerColorChange = function () {
	const darkSections = document.querySelectorAll("section[data-section='dark']");
	const hamburgers = document.querySelectorAll(".header_hamburger");

	darkSections.forEach((section) => {
		const tl = gsap.timeline({
			paused: true,
			scrollTrigger: {
				trigger: section,
				// Change later to match hamburger position from top
				start: "top 32px",
				// Change later to match hamburger position from bot
				end: "bottom 32px",
				onEnter: () => {
					gsap.set(hamburgers, { color: "white" });
				},
				onLeave: () => {
					gsap.set(hamburgers, { color: "black" });
				},
				onEnterBack: () => {
					gsap.set(hamburgers, { color: "white" });
				},
				onLeaveBack: () => {
					gsap.set(hamburgers, { color: "black" });
				},
			},
		});
	});
};

const openFundMap = async function () {
	const mapContainer = document.querySelector(".o-fund-map_map-container");
	if (!mapContainer) return;

	const { Map } = await google.maps.importLibrary("maps");
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

	// Initiate map
	const map = new Map(mapContainer, {
		center: { lat: 54.685095397420255, lng: 25.279804082007665 },
		zoom: 13,
		mapId: "62059a0aae91c7dd",

		// Disable controls
		streetViewControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		rotateControl: false,
		fullscreenControl: false,
		gestureHandling: "auto ",
	});

	// Create a single InfoWindow instance to be reused
	const infoWindow = new google.maps.InfoWindow({
		pixelOffset: new google.maps.Size(0, -10),
	});

	// Track active marker for removing ".is-active" class
	let activeMarker = null;

	// Animate infoWindow opacity
	google.maps.event.addListener(infoWindow, "domready", function () {
		const infoWrap = document.querySelector(".gm-style-iw.gm-style-iw-c");
		const infoPointer = document.querySelector(".gm-style-iw-tc");
		infoWrap.classList.add("is-active");
		infoPointer.classList.add("is-active");
	});

	const fundPosts = document.querySelectorAll(".o-fund-map_item");
	fundPosts.forEach((post) => {
		const postLat = Number(post.querySelector(".o-fund-map_lat").textContent);
		const postLng = Number(post.querySelector(".o-fund-map_lng").textContent);
		const infoContent = post.querySelector(".o-fund-map_content-wrap");

		// Creating map dot for each post
		const mapDotHTML = document.createElement("div");
		mapDotHTML.className = "o-fund-map_dot";

		const marker = new AdvancedMarkerElement({
			map,
			position: { lat: postLat, lng: postLng },
			content: mapDotHTML,
		});

		marker.addListener("click", () => {});

		const showMarkerContent = function () {
			if (activeMarker) {
				activeMarker.classList.remove("is-active");
			}
			mapDotHTML.classList.add("is-active");
			activeMarker = mapDotHTML;
			infoWindow.setContent(infoContent);
			infoWindow.open(map, marker);
		};

		const hideMarkerContent = function () {
			if (activeMarker) {
				activeMarker = null;
			}
			mapDotHTML.classList.remove("is-active");
			infoWindow.close();
		};
		marker.content.addEventListener("mouseover", showMarkerContent);
		marker.content.addEventListener("mouseout", hideMarkerContent);
		marker.content.addEventListener("click", showMarkerContent);
	});
};

const openFundPriceCalc = function () {
	const rangeSliders = document.querySelectorAll(".o-fund-calculator_handle");
	if (rangeSliders.length === 0) return;

	const totalNumber = document.querySelector(".o-fund-calculator_number-value");
	// Global value to store x and y
	let values = [];

	// Callback function that will be called by observer
	const updateTotal = function (mutationRecord) {
		mutationRecord.forEach((record) => {
			const triggerIndex = record.target.dataset.index;
			const newValue = record.target.getAttribute("aria-valuenow");
			values[triggerIndex] = newValue;

			// Formula for calculation
			const totalValue = values[0] * values[1];
			totalNumber.textContent = totalValue;
		});
	};

	// Create observer to listen for attribute value change
	const valueChangeObserver = new MutationObserver(updateTotal);

	rangeSliders.forEach((slider, index) => {
		// Setting index attribute to later retrieve in updateTotal callback function
		slider.dataset.index = index;

		valueChangeObserver.observe(slider, { attributes: true, attributeFilter: ["aria-valuenow"] });
	});
};

const faqAccordion = function () {
	const faqWraps = document.querySelectorAll(".faq_element");
	if (faqWraps.length === 0) return;

	faqWraps.forEach((faqWrap) => {
		const faqItems = faqWrap.querySelectorAll(".faq_item");
		let activeTl = null;
		let activeItem = null;

		// Here create animation and add click listener
		faqItems.forEach((faqItem, index) => {
			const faqAnswerWrap = faqItem.querySelector(".faq_answer-wrap");
			const faqIconWrap = faqItem.querySelector(".faq_icon-wrap");
			const faqHorizontalIcon = faqItem.querySelector(".faq_icon-stripe-h");
			const faqVerticalIcon = faqItem.querySelector(".faq_icon-stripe-v");

			const tl = gsap.timeline({
				paused: true,
				onComplete: () => {
					ScrollTrigger.refresh();
				},
			});
			tl.fromTo(
				faqAnswerWrap,
				{
					y: "32px",
					height: 0,
					autoAlpha: 0,
				},
				{
					y: "0px",
					height: "auto",
					autoAlpha: 1,
					duration: 0.5,
					ease: "power3.inOut",
				}
			);
			tl.to(
				faqIconWrap,
				{
					duration: 0.5,
					rotation: 180,
					ease: "power3.inOut",
				},
				"<"
			);
			tl.to(
				faqVerticalIcon,
				{
					opacity: 0,
					duration: 0.5,
				},
				"<"
			);

			faqItem.addEventListener("click", () => toggleFaqItem(faqItem, tl));

			// Function to toggle faq items
			const toggleFaqItem = function (faqItem, tl) {
				if (activeTl && activeTl !== tl) {
					activeTl.reverse();
					activeItem.classList.remove("is-open");
				}

				faqItem.classList.toggle("is-open");
				faqItem.classList.contains("is-open") ? tl.play() : tl.reverse();

				// Update currently active items
				activeTl = tl;
				activeItem = faqItem;
			};

			if (index === 0) toggleFaqItem(faqItem, tl);
		});
	});
};

const faqSwiper = function () {
	const swiperTarget = document.querySelector(".o-faq-slides_swiper");
	if (!swiperTarget) return;

	const prevBtn = document.querySelector(".o-faq-slides_nav-btn.is-prev");
	const nextBtn = document.querySelector(".o-faq-slides_nav-btn.is-next");
	const slideTitles = document.querySelectorAll(".o-faq-slides_h3");
	const slideNumbers = document.querySelectorAll(".o-faq-slides_number");
	const slideParagraphs = document.querySelectorAll(".o-faq-slides_paragraph");
	const slidesNavTotal = document.querySelector(".o-faq-slides_pagination-number.is-total");
	const slidesNavCurrent = document.querySelector(".o-faq-slides_pagination-number.is-current");

	let slideInTransition = false;

	const setTotalSlides = function (swiperTarget) {
		let totalSlides = swiperTarget.slides.length;
		if (totalSlides < 10) {
			slidesNavTotal.textContent = "0" + totalSlides;
		} else {
			slidesNavTotal.textContent = totalSlides;
		}
	};

	const setNavCurrent = function (slideIndex) {
		if (slideIndex < 10) {
			slidesNavCurrent.textContent = "0" + slideIndex;
		} else {
			slidesNavCurrent.textContent = slideIndex;
		}
	};

	// Function to split slide text into lines and words
	const splitSlideText = function () {
		slideParagraphs.forEach((paragraph) => {
			new SplitType(paragraph, { types: "lines, words" });
		});
	};

	// Function for disabling nav arrows
	const disableNavBtn = function (targetNavBtn, isReverse = false) {
		isReverse ? targetNavBtn.classList.remove("is-disabled") : targetNavBtn.classList.add("is-disabled");
	};

	// Function to set initial states for slide elements
	const setInitialStates = function (elementsArray, childTarget = null) {
		elementsArray.forEach((element, index) => {
			if (index !== 0) {
				if (childTarget) {
					const childElements = element.querySelectorAll(childTarget);
					gsap.set(childElements, { y: "100%" });
				} else {
					gsap.set(element, { y: "100%" });
				}
			}
		});
	};

	// Function to animate in next/prev slide
	const slideInAnimation = function () {
		const currentParagraph = slideParagraphs[swiper.activeIndex];
		const currentWords = currentParagraph.querySelectorAll(".word");
		const elementsToAnimate = [slideTitles[swiper.activeIndex], slideNumbers[swiper.activeIndex], ...currentWords, slidesNavCurrent];

		const inTl = gsap.timeline({
			onComplete: () => {
				slideInTransition = false;
			},
		});
		inTl.to(elementsToAnimate, {
			y: "0%",
			duration: 0.5,
			ease: "power2.out",
		});
	};

	// Function to animate out current slide
	const slideOutAnimation = function (direction) {
		slideInTransition = true;
		const currentParagraph = slideParagraphs[swiper.activeIndex];
		const currentWords = currentParagraph.querySelectorAll(".word");
		const elementsToAnimate = [slideTitles[swiper.activeIndex], slideNumbers[swiper.activeIndex], ...currentWords, slidesNavCurrent];

		const outTl = gsap.timeline({
			onComplete: () => {
				if (direction === "next") {
					setNavCurrent(swiper.activeIndex + 2);
					swiper.slideNext();
				} else if (direction === "prev") {
					setNavCurrent(swiper.activeIndex);
					swiper.slidePrev();
				}
			},
		});

		outTl.to(elementsToAnimate, {
			y: "100%",
			duration: 0.5,
			ease: "power2.out",
		});
	};

	// Function to initialize slides
	const initializeSlides = function () {
		splitSlideText();
		setInitialStates(slideTitles);
		setInitialStates(slideNumbers);
		setInitialStates(slideParagraphs, ".word");
	};

	// Function to add navigation event listeners
	const addNavigationEventListeners = function () {
		prevBtn.addEventListener("click", () => {
			if (!swiper.isBeginning && !slideInTransition) {
				slideOutAnimation("prev");
			}
		});

		nextBtn.addEventListener("click", () => {
			if (!swiper.isEnd && !slideInTransition) {
				slideOutAnimation("next");
			}
		});
	};

	// Initialize swiper
	const swiper = new Swiper(swiperTarget, {
		speed: 100,
		allowTouchMove: false,
		on: {
			init: (swiper) => {
				initializeSlides();
				addNavigationEventListeners();
				disableNavBtn(prevBtn);

				setTotalSlides(swiper);
			},
			slideChangeTransitionEnd: slideInAnimation,
			reachBeginning: () => {
				disableNavBtn(prevBtn);
			},
			reachEnd: () => {
				disableNavBtn(nextBtn);
			},
			fromEdge: () => {
				disableNavBtn(prevBtn, true);
				disableNavBtn(nextBtn, true);
			},
		},
	});
};

const faqNavLinks = function () {
	const faqBlocks = document.querySelectorAll(".o-faq-questions_faq-block");
	const anchorButtons = document.querySelectorAll(".o-faq-questions_anchor-link");
	const tabButtons = document.querySelectorAll(".o-faq-questions_tab-link");

	if (faqBlocks.length === 0 || (!anchorButtons.length && !tabButtons.length)) return;

	let isScrolling = false;
	let activeAnchor = null;
	let mm = gsap.matchMedia();

	const getFaqTotal = (index) => faqBlocks[index].querySelectorAll(".faq_item").length;

	const toggleActiveAnchor = (targetButton) => {
		if (activeAnchor && activeAnchor !== targetButton) {
			activeAnchor.classList.remove("is-active");
		}
		if (activeAnchor !== targetButton) {
			activeAnchor = targetButton;
			targetButton.classList.add("is-active");
		}
	};

	const handleSectionEnter = (index) => {
		if (!isScrolling) toggleActiveAnchor(anchorButtons[index]);
	};

	// Desktop code for anchor links
	mm.add("(min-width: 992px)", () => {
		anchorButtons.forEach((btn, index) => {
			if (index === 0) toggleActiveAnchor(btn);

			const totalAnchorNumber = btn.querySelector(".o-faq-questions_count");
			totalAnchorNumber.textContent = `(${getFaqTotal(index)})`;

			btn.addEventListener("click", () => {
				if (!isScrolling) toggleActiveAnchor(btn);

				const targetId = btn.getAttribute("data-target");
				const targetElement = document.getElementById(targetId);
				if (targetElement) {
					isScrolling = true;
					lenis.scrollTo(targetElement, {
						offset: -200,
						duration: 1.2,
						easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
						lock: true,
						onComplete: () => {
							isScrolling = false;
						},
					});
				}
			});
		});

		faqBlocks.forEach((section, index) => {
			ScrollTrigger.create({
				trigger: section,
				start: "top center",
				end: "bottom center",
				onEnter: () => handleSectionEnter(index),
				onEnterBack: () => handleSectionEnter(index),
			});
		});
	});

	// Tabs code for mobile tabs
	mm.add("(max-width: 991px)", (context) => {
		// Setting initial state (first tab as active)
		let activeTab = faqBlocks[0];
		let activeButton;
		let tabInTransition = false;
		faqBlocks.forEach((tab, index) => {
			if (index !== 0) {
				gsap.set(tab, { opacity: 0, y: "32px", display: "none" });
			}
		});

		// Faq hide/show functions
		const changeTab = function (index, newButton) {
			const oldButtonText = activeButton.querySelector(".o-faq-questions_tab-link-text");
			const newButtonText = newButton.querySelector(".o-faq-questions_tab-link-text");

			tabInTransition = true;
			const newTab = faqBlocks[index];

			const hideTl = gsap.timeline({
				onComplete: () => {
					showTl.play();
				},
			});
			const showTl = gsap.timeline({
				paused: true,
				onComplete: () => {
					activeTab = newTab;
					activeButton = newButton;
					tabInTransition = false;
				},
			});

			// Hide tab timeline
			hideTl
				.to(activeTab, {
					ease: "power1.in",
					opacity: 0,
					y: "32px",
					duration: 0.2,
				})
				.set(
					oldButtonText,
					{
						borderBottom: "none",
					},
					"<"
				)
				.set(
					newButtonText,
					{
						borderBottom: "1px solid black",
					},
					"<"
				)
				.set(newTab, { display: "block" })
				.set(activeTab, { display: "none" });

			// Show tab timeline
			showTl.to(
				newTab,
				{
					ease: "power1.out",
					opacity: 1,
					y: "0px",
					duration: 0.5,
				},
				"+=0.2"
			);
		};

		tabButtons.forEach((button, index) => {
			if (index === 0) {
				gsap.set(button.querySelector(".o-faq-questions_tab-link-text"), { borderBottom: "1px solid black" });
				activeButton = button;
			}

			// Setting total number for tabs
			const totalTabNumber = button.querySelector(".o-faq-questions_count");
			totalTabNumber.textContent = `(${getFaqTotal(index)})`;

			const contextTabAnimation = `tabAnimation${index}`;
			context.add(contextTabAnimation, () => {
				if (activeTab === faqBlocks[index] || tabInTransition) return;
				changeTab(index, button);
			});

			button.addEventListener("click", context[contextTabAnimation]);
		});

		return () => {
			// Cleanup: remove event listeners when media query no longer matches
			tabButtons.forEach((button, index) => {
				const contextTabAnimation = `tabAnimation${index}`;
				button.removeEventListener("click", context[contextTabAnimation]);
			});
		};
	});
};

const initFunctions = function () {
	gsap.registerPlugin(ScrollTrigger);
	smoothScroll();
	menuAnimation();
	rotatingTextAnimation();
	closedFundsListAnimation();
	closedFundsGalleryAnimation();
	fundTooltip();
	contactFormLabels();
	customFormValidation();
	postCategoryCount();
	newsAnchorScroll();
	aboutLinkBlockHoverAnimation();
	contactFormSelect();
	formSuccessWrapHeight();
	imageParallaxAnimation();
	stickyHamburger();
	hideHamburgerOnFooter();
	cookieAllowScroll();
	careerListEmptyHeading();
	hamburgerColorChange();
	openFundMap();
	openFundPriceCalc();
	faqAccordion();
	footerRevealAnimation();
	faqSwiper();
	faqNavLinks();
};

document.addEventListener("DOMContentLoaded", initFunctions);
