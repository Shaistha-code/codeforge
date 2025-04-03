// Demo: Fake AI Recommendations (for judges)
document.getElementById("search-button").addEventListener("click", function() {
    const destination = document.getElementById("destination").value;
    const allergies = document.getElementById("allergies").value;

    if (!destination || !allergies) {
        alert("Please enter a destination and allergies!");
        return;
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> Finding safe options...</p>`;
    
    // Simulate AI processing delay
    fetch("http://localhost:5000/api/recommendations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ destination, allergies })
    })
    .then(response => response.json())
    .then(data => {
        let warning = '';
        if (data.warning) {
            warning = `<div class="warning" style="background:#FFF3CD; padding:10px; border-radius:5px; margin:10px 0;">
                <i class="fas fa-exclamation-triangle"></i> ${data.warning}
            </div>`;
        }
    
        resultsDiv.innerHTML = `
            <h3>🚀 SafeTravel AI Recommendations for ${data.destination}</h3>
            <p><strong>Allergies Avoided:</strong> ${data.allergies}</p>
            ${warning}
            <div class="recommendation">
                <h4>🍽️ Safe Restaurants</h4>
                <ul>
                    ${data.restaurants.map(restaurant => `<li>${restaurant}</li>`).join("")}
                </ul>
            </div>
            <div class="recommendation">
                <h4>🏨 Allergy-Friendly Hotels</h4>
                <ul>
                    ${data.hotels.map(hotel => `<li>${hotel}</li>`).join("")}
                </ul>
            </div>
        `;
    })
    .catch(error => {
        console.error("Error fetching recommendations:", error);
        resultsDiv.innerHTML = `<p style="color: red;">❌ Error fetching recommendations. Please try again.</p>`;
    });
    
});

// Animate CTA button
document.getElementById("cta-button").addEventListener("mouseover", function() {
    this.innerHTML = "Get Started Free →";
});

document.getElementById("cta-button").addEventListener("mouseout", function() {
    this.innerHTML = "Plan Your Trip →";
});

// Geolocation with error handling
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            alert(`🌎 Welcome! We see you're near latitude ${pos.coords.latitude.toFixed(1)}`);
        },
        (error) => {
            console.log("Geolocation error:", error);
            // Optional: Show a less intrusive message
            document.getElementById("location-message").innerHTML = 
                "<p><i class='fas fa-map-marker-alt'></i> Enable location for personalized alerts</p>";
        }
    );
}