function generatePrescription() {
    const patientName = document.getElementById('patientName').value;
    const medicationName = document.getElementById('medicationName').value;
    const dosage = document.getElementById('dosage').value;
    const directions = document.getElementById('directions').value;
    const doctorName = document.getElementById('doctorName').value;
    const date = document.getElementById('date').value;

    // Prescription Text
    const prescriptionText = `
        Patient: ${patientName}
        Medication: ${medicationName}
        Dosage: ${dosage}
        Directions: ${directions}
        Doctor: ${doctorName}
        Date: ${date}
    `;

    // Medication Label
    const labelText = `
        ${medicationName} - ${dosage}
        Directions: ${directions}
        Doctor: Dr. ${doctorName}
        Patient: ${patientName}
        Date: ${date}
    `;

    // Output Prescription Text
    document.getElementById('prescriptionText').textContent = prescriptionText;
    document.getElementById('labelText').textContent = labelText;

    // Show the Output
    document.getElementById('prescriptionOutput').style.display = 'block';
}

function downloadPDF() {
    const doc = new jsPDF();
    const prescriptionText = document.getElementById('prescriptionText').textContent;
    const labelText = document.getElementById('labelText').textContent;

    doc.text(20, 30, `Prescription: \n\n${prescriptionText}`);
    doc.text(20, 100, `Medication Label: \n\n${labelText}`);

    doc.save('prescription.pdf');
}
