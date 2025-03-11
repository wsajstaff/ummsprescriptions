document.addEventListener("DOMContentLoaded", function () {
    const password = "secure"; // Change this
    let authenticated = false;

    // Show password prompt before allowing prescription creation
    function checkPassword() {
        if (!authenticated) {
            let userPass = prompt("Enter password to create a prescription:");
            if (userPass === password) {
                authenticated = true;
                document.getElementById("prescriptionForm").style.display = "block";
            } else {
                alert("Incorrect password!");
            }
        }
    }

    document.getElementById("createPrescriptionBtn").addEventListener("click", checkPassword);

    // Fetch RxCUI for a given medicine
    async function getRxCUI(medicineName) {
        let response = await fetch(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search=${medicineName}`);
        let data = await response.json();

        if (data.idGroup.rxnormId) {
            return data.idGroup.rxnormId[0];
        } else {
            alert("No RxCUI found for this medicine.");
            return null;
        }
    }

    // Get dosage forms for a given RxCUI
    async function fetchDosageForms(medicineName) {
        let rxcui = await getRxCUI(medicineName);
        if (!rxcui) return;

        let response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=SCD+SBD`);
        let data = await response.json();
        let forms = data.relatedGroup.conceptGroup;

        let dropdown = document.getElementById("dosageForm");
        dropdown.innerHTML = "<option>Select dosage form</option>";

        if (forms) {
            forms.forEach(group => {
                group.conceptProperties.forEach(item => {
                    let option = document.createElement("option");
                    option.value = item.name;
                    option.textContent = item.name;
                    dropdown.appendChild(option);
                });
            });
        } else {
            alert("No dosage forms found.");
        }
    }

    document.getElementById("medicine").addEventListener("change", function () {
        fetchDosageForms(this.value);
    });

    // Generate prescription and PDF
    function createPrescription() {
        let medicine = document.getElementById("medicine").value;
        let dosageForm = document.getElementById("dosageForm").value;
        if (!medicine || dosageForm === "Select dosage form") {
            alert("Please select a valid medicine and dosage form.");
            return;
        }

        let prescriptionCode = Math.random().toString(36).substring(7).toUpperCase();
        document.getElementById("prescriptionCode").textContent = `Prescription Code: ${prescriptionCode}`;

        let prescription = { medicine, form: dosageForm, code: prescriptionCode };
        generatePDF(prescription);
    }

    document.getElementById("generatePrescriptionBtn").addEventListener("click", createPrescription);

    // Generate Walmart-style label
    async function generatePDF(prescription) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [80, 100] // Receipt-like label size
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Walmart Pharmacy", 10, 10);
        doc.setFontSize(10);
        doc.text("1234 Walmart Dr, Your City, ST 00000", 10, 16);

        doc.setFontSize(12);
        doc.text(`Rx #: ${prescription.code}`, 10, 26);

        doc.setFont("helvetica", "normal");
        doc.text(`Date Filled: ${new Date().toLocaleDateString()}`, 10, 34);

        doc.setFont("helvetica", "bold");
        doc.text(`${prescription.medicine}`, 10, 42);
        doc.setFont("helvetica", "normal");
        doc.text(`Form: ${prescription.form}`, 10, 48);

        doc.setFontSize(10);
        doc.text("Take as directed by your doctor.", 10, 56);

        doc.setFontSize(9);
        doc.text("⚠ May cause drowsiness.", 10, 66);
        doc.text("⚠ Take with food.", 10, 72);

        doc.text("▮▮▮▮▮▮▮▮", 10, 80);

        doc.save(`Prescription_${prescription.code}.pdf`);
    }
});
