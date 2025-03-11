const ADMIN_PASSWORD = "securepass"; // Change this to your desired password
let prescriptions = {}; // Stores prescriptions in memory

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
    if (query.length < 3) return;
    try {
        let response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`);
        let data = await response.json();
        let medicines = data.drugGroup?.conceptGroup?.flatMap(group => group.conceptProperties) || [];

        showMedicineSuggestions(medicines);
    } catch (error) {
        console.error("API Error:", error);
    }
}

// Show medicine suggestions in a dropdown
function showMedicineSuggestions(medicines) {
    let list = document.getElementById("medicineSuggestions");
    list.innerHTML = "";
    medicines.forEach(med => {
        let item = document.createElement("div");
        item.textContent = med.name;
        item.onclick = () => {
            document.getElementById("medicine").value = med.name;
            list.innerHTML = "";
            fetchDosageForms(med.rxcui);
        };
        list.appendChild(item);
    });
}

// Fetch available dosage forms for selected medicine
async function fetchDosageForms(rxcui) {
    try {
        let response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=SCD+SBD`);
        let data = await response.json();
        let relatedGroup = data.relatedGroup.conceptGroup || [];

        let dosageForms = new Set();
        relatedGroup.forEach(group => {
            group.conceptProperties.forEach(prop => {
                let [strength, form] = prop.name.split(' [');
                form = form?.replace(']', '');
                if (form) {
                    dosageForms.add(`${strength.trim()} - ${form.trim()}`);
                }
            });
        });

        populateDosageFormDropdown([...dosageForms]);
    } catch (error) {
        console.error("API Error:", error);
    }
}

// Populate the dosage dropdown
function populateDosageFormDropdown(dosageForms) {
    let dropdown = document.getElementById("dosageForm");
    dropdown.innerHTML = '<option value="">Select dosage</option>';
    dosageForms.forEach(dosageForm => {
        let option = document.createElement("option");
        option.value = dosageForm;
        option.textContent = dosageForm;
        dropdown.appendChild(option);
    });
}

// Generate a prescription
function generatePrescription() {
    let medicine = document.getElementById("medicine").value.trim();
    let dosageForm = document.getElementById("dosageForm").value;
    if (!medicine || !dosageForm) {
        alert("Please enter medicine and select dosage.");
        return;
    }

    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
    prescriptions[code] = { medicine, dosageForm };

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
        <p><strong>Dosage/Form:</strong> ${prescription.dosageForm}</p>
        <button onclick="downloadPDF('${code}')">Download PDF</button>
    `;

    document.getElementById("prescriptionDetails").innerHTML = detailsHTML;
}

// Generate a prescription label PDF
function downloadPDF(code) {
    let prescription = prescriptions[code];
    if (!prescription) return;

    const { jsPDF } = window.jspdf;
    let doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 120] });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PRESCRIPTION LABEL", 10, 10);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.rect(5, 5, 70, 110);

    doc.text(`Prescription Code: ${code}`, 10, 20);
    doc.text(`Medicine: ${prescription.medicine}`, 10, 30);
    doc.text(`Dosage/Form: ${prescription.dosageForm}`, 10, 40);
    doc.text(`Take as directed.`, 10, 50);
    doc.text(`Refills: 0`, 10, 60);
    doc.text(`Doctor: Dr. Smith`, 10, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 80);

    doc.save(`Prescription_Label_${code}.pdf`);
}
