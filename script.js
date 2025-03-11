const ADMIN_PASSWORD = "securepass"; // Change this to your desired password

// Retrieve stored prescriptions from local storage
let prescriptions = JSON.parse(localStorage.getItem("prescriptions")) || {};

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

// Generate a prescription with a code
function generatePrescription() {
    let medicine = document.getElementById("medicine").value.trim();
    if (!medicine) {
        alert("Please enter a medicine name.");
        return;
    }

    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
    prescriptions[code] = { medicine };

    // Save prescriptions to local storage
    localStorage.setItem("prescriptions", JSON.stringify(prescriptions));

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
