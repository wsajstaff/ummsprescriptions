const RXNORM_API = "https://rxnav.nlm.nih.gov/REST/drugs.json?name=";

// Fetch medication names from RxNorm API
document.getElementById("medicine").addEventListener("input", function () {
    let query = this.value.trim();
    if (query.length < 2) return;

    fetch(RXNORM_API + encodeURIComponent(query))
        .then(response => response.json())
        .then(data => {
            let suggestions = "";
            if (data.drugGroup && data.drugGroup.conceptGroup) {
                data.drugGroup.conceptGroup.forEach(group => {
                    if (group.conceptProperties) {
                        group.conceptProperties.forEach(drug => {
                            suggestions += `<option value="${drug.name}"></option>`;
                        });
                    }
                });
            }
            document.getElementById("medicineList").innerHTML = suggestions;
        })
        .catch(error => console.error("Error fetching medication data:", error));
});

// Generate a prescription and store it locally
function generatePrescription() {
    let medicine = document.getElementById("medicine").value;
    let dosage = document.getElementById("dosage").value;

    if (!medicine || !dosage) {
        alert("Please fill in all fields.");
        return;
    }

    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
    let prescription = { medicine, dosage };

    localStorage.setItem(code, JSON.stringify(prescription));

    document.getElementById("generatedCode").innerHTML = `Prescription Code: <strong>${code}</strong>`;
}

// Lookup prescription by code
function lookupPrescription() {
    let code = document.getElementById("code").value.toUpperCase();
    let prescription = localStorage.getItem(code);

    if (!prescription) {
        document.getElementById("prescriptionDetails").innerHTML = "<p style='color: red;'>Prescription not found!</p>";
        return;
    }

    prescription = JSON.parse(prescription);
    document.getElementById("prescriptionDetails").innerHTML = `
        <p><strong>Medicine:</strong> ${prescription.medicine}</p>
        <p><strong>Dosage:</strong> ${prescription.dosage}</p>
    `;
}
