// Array of space facts for the random fact feature
const spaceFacts = [
    "A year on Mercury is just 88 days long!",
    "Venus is the hottest planet in our solar system.",
    "The Sun contains 99.86% of the mass in our solar system.",
    "Jupiter's Great Red Spot is shrinking!",
    "Saturn's rings are mostly made of water ice.",
    "It takes 8 minutes for light from the Sun to reach Earth.",
    "There are more stars in space than grains of sand on Earth.",
    "The footprints on the Moon will last for 100 million years!"
];

// Function to display a random space fact
function displayRandomSpaceFact() {
    const factIndex = Math.floor(Math.random() * spaceFacts.length);
    const factElement = document.createElement('div');
    factElement.className = 'space-fact';
    factElement.innerHTML = `<strong>🚀 Did You Know?</strong> ${spaceFacts[factIndex]}`;
    document.querySelector('.filters').insertAdjacentElement('beforebegin', factElement);
}

// Function to create the modal
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal when clicking the X or outside the modal
    modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
    return modal;
}

// Function to show content in modal
function showInModal(content) {
    const modal = document.querySelector('.modal') || createModal();
    modal.querySelector('.modal-body').innerHTML = content;
    modal.style.display = 'block';
}

// Function to create gallery item HTML
function createGalleryItem(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'gallery-item';
    
    if (item.media_type === 'video') {
        // Handle video content
        itemElement.innerHTML = `
            <div class="video-thumbnail">
                <img src="${item.thumbnail_url || 'img/video-placeholder.jpg'}" alt="${item.title}">
                <div class="video-play-button">▶️</div>
            </div>
            <h3>${item.title}</h3>
            <p class="date">${new Date(item.date).toLocaleDateString()}</p>
        `;
    } else {
        // Handle image content
        itemElement.innerHTML = `
            <img src="${item.url}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p class="date">${new Date(item.date).toLocaleDateString()}</p>
        `;
    }

    // Add click handler to show modal
    itemElement.onclick = () => {
        const modalContent = item.media_type === 'video' 
            ? `
                <iframe width="100%" height="400" 
                    src="${item.url.replace('watch?v=', 'embed/')}" 
                    frameborder="0" allowfullscreen>
                </iframe>
            ` 
            : `<img src="${item.url}" alt="${item.title}">`;

        showInModal(`
            ${modalContent}
            <h2>${item.title}</h2>
            <p class="date">${new Date(item.date).toLocaleDateString()}</p>
            <p class="explanation">${item.explanation}</p>
        `);
    };

    return itemElement;
}

// Use this URL to fetch NASA APOD JSON data
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Main function to fetch and display images
async function fetchAndDisplayImages() {
    const gallery = document.getElementById('gallery');
    
    // Show loading message
    gallery.innerHTML = '<div class="loading">🔄 Loading space photos...</div>';

    try {
        // Fetch the data
        const response = await fetch(apodData);
        const data = await response.json();

        // Clear loading message
        gallery.innerHTML = '';

        // Create and append gallery items
        data.forEach(item => {
            gallery.appendChild(createGalleryItem(item));
        });
    } catch (error) {
        gallery.innerHTML = '<div class="error">⚠️ Error loading images. Please try again.</div>';
        console.error('Error:', error);
    }
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Display a random space fact
    displayRandomSpaceFact();

    // Add click handler for the fetch button
    document.getElementById('getImageBtn').addEventListener('click', fetchAndDisplayImages);
});