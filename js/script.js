// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchBtn = document.getElementById('fetchBtn');
const gallery = document.getElementById('gallery');
const spaceFactBox = document.getElementById('spaceFact');
const includeVideosCheckbox = document.getElementById('includeVideos');
const pauseFactsBtn = document.getElementById('pauseFacts');

// Modal elements
const modal = document.getElementById('apodModal');
const modalMedia = modal.querySelector('.modal-media');
const modalTitle = modal.querySelector('.modal-title');
const modalDate = modal.querySelector('.modal-date');
const modalExplanation = modal.querySelector('.modal-explanation');
const modalCloseBtn = modal.querySelector('.modal-close');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Your NASA API key (for real usage replace with your own key)
// NOTE: Keeping it simple for student learning.
const API_KEY = 'AlMHcc4w8jKDiH4GffBaDsVhg86zqbsuCgVIaORX';

// Toggle detailed console logging for debugging
const DEBUG = true;

// Simple list of fun space facts
const spaceFacts = [
	'Did you know? A day on Venus is longer than its year!',
	'Neutron stars can spin 600 times per second.',
	'There are more trees on Earth than stars in the Milky Way (trillions vs ~100–400 billion).',
	'Jupiter has 95 confirmed moons as of 2025.',
	'The coldest known place in the universe is the Boomerang Nebula at -272°C.',
	'A spoonful of neutron star would weigh about a billion tons.',
	'Saturn would float if you could put it in water—its density is less than water.',
	'Mars appears red due to iron oxide (rust) on its surface.',
	'The Sun accounts for 99.86% of the mass in our solar system.',
	'Light from the Sun takes about 8 minutes to reach Earth.'
];

// Show a random space fact on page load
function showRandomFact() {
	const fact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
	spaceFactBox.classList.remove('fade-in');
	spaceFactBox.classList.add('fade-out');
	// Delay text swap until fade-out ends
	setTimeout(() => {
		spaceFactBox.textContent = fact;
		spaceFactBox.classList.remove('fade-out');
		spaceFactBox.classList.add('fade-in');
	}, 500);
}
showRandomFact();

// Rotate facts every 10 seconds unless paused
let factIntervalId = null;
let factsPaused = false;

function startFactRotation() {
	if (factIntervalId) clearInterval(factIntervalId);
	factIntervalId = setInterval(() => {
		if (!factsPaused) {
			showRandomFact();
		}
	}, 10000); // 10 seconds
}
startFactRotation();

pauseFactsBtn.addEventListener('click', () => {
	factsPaused = !factsPaused;
	pauseFactsBtn.setAttribute('aria-pressed', String(factsPaused));
	pauseFactsBtn.textContent = factsPaused ? 'Resume Facts' : 'Pause Facts';
	if (!factsPaused) {
		showRandomFact();
	}
});

// Build the API URL using start and end dates
function buildApiUrl(startDate, endDate) {
	// We'll use the APOD "range" endpoint
	const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
	if (DEBUG) console.info('[APOD] Built URL:', url);
	return url;
}

// Render a loading message while we wait for the API
function showLoading() {
	gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">🚀</div><p>🔄 Loading space photos…</p></div>`;
	if (DEBUG) console.info('[APOD] Loading started');
}

// Render an error message if something goes wrong
function showError(message) {
	gallery.innerHTML = `<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>${message}</p></div>`;
	if (DEBUG) console.warn('[APOD] Error:', message);
}

// Simple fallback sample data (static) so students can still see UI when API is down
const SAMPLE_APOD = [
	{
		date: '2024-01-01',
		title: 'Sample: Pillars of Creation',
		explanation: 'This is sample data shown because the NASA APOD API is currently unavailable. Normally, you would see the real explanation of this breathtaking Hubble image.',
		media_type: 'image',
		url: 'https://apod.nasa.gov/apod/image/1510/pillars2015_hubble_960.jpg'
	},
	{
		date: '2024-01-02',
		title: 'Sample: Earthrise Over the Moon',
		explanation: 'Sample fallback entry. The famous Earthrise photograph reminds us of Earth’s fragility in space.',
		media_type: 'image',
		url: 'https://apod.nasa.gov/apod/image/1812/earthrise2_apollo8_960.jpg'
	},
	{
		date: '2024-01-03',
		title: 'Sample Video: Journey Through the Stars',
		explanation: 'Sample video entry. A placeholder for a cosmic tour. When the API outage ends you will see real APOD videos here.',
		media_type: 'video',
		url: 'https://www.youtube.com/embed/GO5FwsblpT8'
	}
];

// Create a single gallery item element
function createGalleryItem(item) {
	// item.media_type can be 'image' or 'video'
	const div = document.createElement('div');
	div.className = 'gallery-item';

	// We handle videos gracefully (extra credit)
	let mediaHTML = '';
	if (item.media_type === 'image') {
		// Use the URL field for images (url or hdurl)
		const imgSrc = item.url;
		mediaHTML = `<img src="${imgSrc}" alt="${item.title}" loading="lazy" />`;
	} else if (item.media_type === 'video') {
		// For videos (often YouTube), we can embed or show a link
		// Simpler for students: show a thumbnail-like iframe and a label
		mediaHTML = `<div class="video-wrapper"><iframe src="${item.url}" title="${item.title}" frameborder="0" allowfullscreen></iframe></div>`;
	}

	div.innerHTML = `
		${mediaHTML}
		<p><strong>${item.title}</strong><br><span>${item.date}</span></p>
	`;

	// Click opens modal with more details
	div.addEventListener('click', () => openModal(item));
	return div;
}

// Render all items in the gallery
function renderGallery(items) {
	// Sort newest first (optional)
	const sorted = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
	gallery.innerHTML = '';
	sorted.forEach(item => {
		// Filter videos if checkbox unchecked
		if (!includeVideosCheckbox.checked && item.media_type === 'video') return;
		gallery.appendChild(createGalleryItem(item));
	});
}

// Fetch APOD data for the selected date range
async function fetchApodRange() {
	const startDate = startInput.value;
	const endDate = endInput.value;
	if (DEBUG) console.info('[APOD] Fetch requested for range:', startDate, 'to', endDate);

	// Basic validation: ensure start <= end
	if (new Date(startDate) > new Date(endDate)) {
		showError('Start date must be before end date. Please fix your selection.');
		return;
	}

	showLoading();
	try {
		const url = buildApiUrl(startDate, endDate);
		const response = await fetch(url);
		if (!response.ok) {
				// If service outage message appears, handle gracefully
				if (response.status === 503 || response.status === 500) {
					showError('NASA APOD service appears to be down (server error). Please try again later.');
					if (DEBUG) console.warn('[APOD] Server error status:', response.status);
					return;
				}
			throw new Error(`API error: ${response.status}`);
		}
		const data = await response.json();
			if (DEBUG) console.info('[APOD] Raw response data:', data);
			// Some outages return an object with an error or note instead of array
			if (data && !Array.isArray(data)) {
				const outageText = JSON.stringify(data).toLowerCase();
				if (outageText.includes('outage') || outageText.includes('unavailable')) {
					showError('⚠ NASA APOD API reports an outage. Images cannot be loaded right now.');
					if (DEBUG) console.warn('[APOD] Outage detected in response body');
							// Render fallback sample data so UI still demonstrates functionality
							renderGallery(SAMPLE_APOD);
							if (DEBUG) console.info('[APOD] Rendered SAMPLE_APOD fallback items');
					return;
				}
			}
		// The API returns an array of objects
		if (!Array.isArray(data) || data.length === 0) {
			showError('No images found for that date range. Try different dates.');
				if (DEBUG) console.warn('[APOD] Empty array returned');
			return;
		}
		renderGallery(data);
			if (DEBUG) console.info('[APOD] Gallery rendered with', data.length, 'items');
	} catch (err) {
		console.error(err);
		showError('Something went wrong fetching images. Please try again later.');
	}
}

// Open modal with full details
function openModal(item) {
	// Clear previous content
	modalMedia.innerHTML = '';

	if (item.media_type === 'image') {
		const img = document.createElement('img');
		img.src = item.hdurl || item.url; // hdurl is higher quality if available
		img.alt = item.title;
		modalMedia.appendChild(img);
	} else if (item.media_type === 'video') {
		const iframe = document.createElement('iframe');
		iframe.src = item.url;
		iframe.title = item.title;
		iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
		iframe.allowFullscreen = true;
		modalMedia.appendChild(iframe);
	}

	modalTitle.textContent = item.title;
	modalDate.textContent = item.date;
	modalExplanation.textContent = item.explanation;

	modal.setAttribute('aria-hidden', 'false');
	// Trap focus on close button for simplicity
	modalCloseBtn.focus();
	document.body.style.overflow = 'hidden';
	// Close on Escape key
	window.addEventListener('keydown', handleEscKey);
}

// Close modal
function closeModal() {
	modal.setAttribute('aria-hidden', 'true');
	document.body.style.overflow = '';
	window.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
	if (e.key === 'Escape') {
		closeModal();
	}
}

// Event listeners
fetchBtn.addEventListener('click', fetchApodRange);
includeVideosCheckbox.addEventListener('change', () => {
	// Re-fetch current range to apply filter (or re-render cached data if stored)
	fetchApodRange();
});
modalCloseBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
	// Close when clicking backdrop (outside modal content)
	if (e.target === modal) {
		closeModal();
	}
});

// Fetch initial images (optional – show default 9 days on load)
fetchApodRange();
