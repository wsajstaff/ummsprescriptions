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

    // Fetch medicine suggestions from API
    async function fetchMedicines(query) {
        let response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${query}`);
        let data = await response.json();

        let suggestions = document.getElementById("medicineSuggestions");
        suggestions.innerHTML = ""; // Clear previous suggestions

        if (data.idGroup.rxnormId) {
            data.idGroup.rxnormId.forEach(id => {
                let option = document.createElement("option");
                option.value = query;
                suggestions.appendChild(option);
            });
        }
    }

    document.getElementById("medicine").addEventListener("input", function () {
        fetchMedicines(this.value);
    });

    // Generate prescription and PDF
    function createPrescription() {
        let medicine = document.getElementById("medicine").value;
        if (!medicine) {
            alert("Please enter a valid medicine.");
            return;
        }

        let prescriptionCode = Math.random().toString(36).substring(7).toUpperCase();
        document.getElementById("prescriptionCode").textContent = `Prescription Code: ${prescriptionCode}`;

        let prescription = { medicine, code: prescriptionCode };
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

        doc.setFontSize(10);
        doc.text("Take as directed by your doctor.", 10, 50);
        doc.text("⚠ May cause drowsiness.", 10, 60);
        doc.text("⚠ Take with food.", 10, 66);

        doc.text("▮▮▮▮▮▮▮▮", 10, 80);

        doc.save(`Prescription_${prescription.code}.pdf`);
    }
});
