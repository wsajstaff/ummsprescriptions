const ADMIN_PASSWORD = "securepass"; // Change this to your desired password

// Store prescriptions in memory (Gone on refresh)
let prescriptions = {};

// Unlock the prescription creator
function unlockCreator() {
    let passwordInput = document.getElementById("password").value;
    if (passwordInput === ADMIN_PASSWORD) {
        document.getElementById("passwordSection").style.display = "none";
        document.getElementById("creatorSection").style.display = "block";
    } else {
        document.getElementById("passwordError").innerText = "Incorrect password!";
    }
}

// Fetch real medicine names from RxNorm API
async function fetchMedicines(query) {
    if (query.length < 3) return; // Only search if 3+ characters
    try {
        let response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`);
        let data = await response.json();
        let medicines = data.drugGroup?.conceptGroup?.flatMap(group => group.conceptProperties) || [];
        
        let suggestions = medicines.map(med => med.name).slice(0, 5); // Show top 5 results
        showMedicineSuggestions(suggestions);
    } catch (error) {
        console.error("API Error:", error);
    }
}

// Show medicine suggestions in a dropdown
function showMedicineSuggestions(suggestions) {
    let list = document.getElementById("medicineSuggestions");
    list.innerHTML = "";
    suggestions.forEach(med => {
        let item = document.createElement("div");
        item.textContent = med;
        item.onclick = () => {
            document.getElementById("medicine").value = med;
            list.innerHTML = "";
        };
        list.appendChild(item);
    });
}

// Generate a prescription
function generatePrescription() {
    let medicine = document.getElementById("medicine").value.trim();
    if (!medicine) {
        alert("Please enter a medicine name.");
        return;
    }

    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
    prescriptions[code] = { medicine };

    document.getElementById("generatedCode").innerHTML = `Prescription Code: <strong>${code}</strong>`;
}

// Lookup prescription by code
function lookupPrescription() {
    let code = document.getElementById("code").value.toUpperCase();
    let prescription = prescriptions[code];

    if (!prescription) {
        document.getElementById("prescriptionDetails").innerHTML = "<p style='color: red;'>Prescription not found!</p>";
        return;
    }

    let detailsHTML = `
        <p><strong>Medicine:</strong> ${prescription.medicine}</p>
        <button onclick="downloadPDF('${code}')">Download PDF</button>
    `;

    document.getElementById("prescriptionDetails").innerHTML = detailsHTML;
}

// Generate and download a prescription PDF
function downloadPDF(code) {
    let prescription = prescriptions[code];
    if (!prescription) return;

    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Prescription", 20, 20);

    doc.setFontSize(12);
    doc.text(`Prescription Code: ${code}`, 20, 40);
    doc.text(`Medicine: ${prescription.medicine}`, 20, 50);

    doc.save(`Prescription_${code}.pdf`);
}

// Event Listener for Medicine Search
document.getElementById("medicine").addEventListener("input", (event) => {
    fetchMedicines(event.target.value);
});
