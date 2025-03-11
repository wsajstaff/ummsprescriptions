const RXNORM_API = "https://rxnav.nlm.nih.gov/REST/drugs.json?name=";

// Prescription database (replace with a real database later)
let prescriptions = {
    "ABC123": { medicine: "Ibuprofen" },
    "XYZ789": { medicine: "Paracetamol" }
};

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
