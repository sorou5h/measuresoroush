let windowSectionCounter = 1; // Initialize the counter

            // Function to update the "Concrete" count in the customer section
            function updateWallCount(checkbox) {
                // Get the Concrete input field in the customer section
                const wallInput = document.getElementById('wall');

                // Check if the checkbox is checked or unchecked
                if (checkbox.checked) {
                    // If checked, increment the count in the "Concrete" field
                    wallInput.value = parseInt(wallInput.value || 0) + 1;
                } else {
                    // If unchecked, decrement the count in the "Concrete" field (if greater than 0)
                    wallInput.value = Math.max(parseInt(wallInput.value || 0) - 1, 0);
                }
            }
    
            function updateTDCount(checkbox) {
                // Get the TD input field in the customer section
                const tdInput = document.getElementById('td');

                // Check if the checkbox is checked or unchecked
                if (checkbox.checked) {
                    // If checked, increment the count in the "Take Down" field
                    tdInput.value = parseInt(tdInput.value || 0) + 1;
                } else {
                    // If unchecked, decrement the count in the "Take Down" field (if greater than 0)
                    tdInput.value = Math.max(parseInt(tdInput.value || 0) - 1, 0);
                }
            }

            function convertToFraction(input) {
            // Get the input value
                const inputValue = input.value.trim();

                // Check if the input is a fraction or a valid decimal
                const isFraction = /^\d+\/\d+$/.test(inputValue);
                const isValidDecimal = /^(\d*\.\d{3,5})?$/.test(inputValue);

                if (isFraction || isValidDecimal || inputValue === "") {
                    // If the input is a fraction, a valid decimal, or an empty string, leave it as it is
                    if (isValidDecimal) {
                        input.value = convertDecimalToFraction(inputValue);
                    }
                } else {
                    // If the input is neither a fraction nor a valid decimal, show an error or handle it as needed
                    console.error('Invalid input value');
                    // You may want to add further handling for invalid input
                }
            }

            function convertDecimalToFraction(decimal) {
                const tolerance = 1.0E-9;
                const inchFractions = [1, 2, 4, 8, 16, 32, 64];

                // Round to the nearest 1/8th inch
                const roundedDecimal = Math.round(decimal * 8) / 8;

                for (let denominator of inchFractions) {
                    for (let numerator = Math.round(roundedDecimal * denominator); numerator <= Math.round(roundedDecimal * denominator) + 1; numerator++) {
                        if (Math.abs(roundedDecimal - numerator / denominator) < tolerance) {
                            const wholePart = Math.floor(numerator / denominator);
                            const remainder = numerator % denominator;

                            if (remainder !== 0) {
                                if (wholePart === 0) {
                                    return `${remainder}/${denominator}`;
                                } else {
                                    return `${wholePart} ${remainder}/${denominator}`;
                                }
                            } else {
                                return `${wholePart}`;
                            }
                        }
                    }
                }
                return `${roundedDecimal.toFixed(3)}`; // Default to decimal inches if no matching fraction is found
            }

            function addWindowSection() {
                // Clone the entire window information section and append it to the form
                const windowSections = document.querySelectorAll('.window-container');
                const lastWindowSection = windowSections[windowSections.length - 1];

                if (lastWindowSection) {
                    const newWindowSection = lastWindowSection.cloneNode(true);

                    // Increment the counter for the next window section
                    windowSectionCounter++;

                    // Update the section number in the cloned window section
                    const sectionNumberElement = newWindowSection.querySelector('.section-number');
                    if (sectionNumberElement) {
                        sectionNumberElement.textContent = windowSectionCounter;
                    }

                    // Reset input field values in the cloned section
                    newWindowSection.querySelectorAll('input, select').forEach(element => {
                        element.value = '';

                        // Reset checkbox states
                        if (element.type === 'checkbox') {
                            element.checked = false;
                        }
                    });

                    // Append the new window section to the form
                    document.querySelector('form').appendChild(newWindowSection);

                    // Show the remove button when adding sections
                    const removeWindowButton = document.getElementById('removeWindowButton');
                    removeWindowButton.style.display = 'inline-block';
                } else {
                    console.error('No existing window section found.');
                }
            }

            function saveData() {
                const customerData = {
                    customerName: document.getElementById('customerName').value,
                    orderNumber: document.getElementById('orderNumber').value,
                    storeNumber: document.getElementById('storeNumber').value,
                    date: document.getElementById('date').value,
                    // intallerID: document.getElementById('intallerID').value,
                    // intallerName: document.getElementById('intallerName').value,
                };
                const roomElement = document.getElementById(`room${windowSectionCounter}`);
                if (roomElement) {
                    roomElement.value = roomElement.value.toUpperCase();
                }
                const windowDataList = [];
                const windowSections = document.querySelectorAll('windowInfoSection');
                windowSections.forEach((windowSection, index) => {
                    // Add a check for null before accessing properties
                    const roomElement = windowSection.querySelector('input[name="room"]');
                    const quantityElement = windowSection.querySelector('quantity');
                    const mountElement = windowSection.querySelector('mount');
                    const widthElement = windowSection.querySelector('width');
                    const heightElement = windowSection.querySelector('height');
                    const depthElement = windowSection.querySelector('depth');

                    if (roomElement && quantityElement && mountElement && widthElement && heightElement && depthElement) {
                        const convertedWidth = convertDimensionsToFraction(parseFloat(widthElement.value));
                        const convertedHeight = convertDimensionsToFraction(parseFloat(heightElement.value));


                        const windowData = {
                            room: roomElement.value,
                            quantity: quantityElement.value,
                            mount: mountElement.value,
                            width: widthElement.value,
                            height: heightElement.value,
                            depth: depthElement.value,
                        };
                        windowDataList.push(windowData);
                    } else {
                        console.error('One or more elements in the window section are null.');
                    }
                });

                console.log('Customer Data:', customerData);
                console.log('Window Data List:', windowDataList);
                // Generate PDF
                const pdfData = {
                    customerData,
                    windowDataList,
                };

                generatePDF(pdfData);
            }    

            function generatePDF(data) {
                const addButton = document.getElementById('addWindowButton');
                const saveButton = document.getElementById('saveButton');
                const clearButton = document.getElementById('clearButton');
                const commentButton = document.getElementById('commentButton');
                const removeWindowButton = document.getElementById('removeWindowButton');
                const removeCommentButton = document.getElementById('removeCommentButton');

                addButton.style.display = 'none';
                saveButton.style.display = 'none';
                clearButton.style.display = 'none';
                commentButton.style.display = 'none';
                removeWindowButton.style.display = 'none';
                removeCommentButton.style.display = 'none';

                // Extract customer name and order number from the data
                const customerName = data.customerData.customerName;
                const orderNumber = data.customerData.orderNumber;

                // Convert spaces to underscores and remove any special characters
                const sanitizedCustomerName = customerName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                const sanitizedOrderNumber = orderNumber.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

                // Generate PDF with customer name and order number in the filename
                html2pdf().from(document.body)
                .set({
                    filename: `${sanitizedCustomerName}_${sanitizedOrderNumber}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    // html2canvas: { scale: 1.5 }, // Reduced scale
                    jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' },
                })
                .toPdf()
                .get('pdf')
                .then(function (pdf) {
                    const totalPages = pdf.internal.getNumberOfPages();
                    pdf.setFontSize(10); // Set the font size for the page numbers
                    pdf.setTextColor(150); // Set the text color for the page numbers
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.text('Page ' + i + ' of ' + totalPages, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 5);
                    }
                })
                .save()
                .then(() => {
                    addButton.style.display = 'inline-block';
                    saveButton.style.display = 'inline-block';
                    clearButton.style.display = 'inline-block';
                    commentButton.style.display = 'inline-block';
                    removeWindowButton.style.display = 'inline-block';
                    removeCommentButton.style.display = 'inline-block';
                })
                .catch((error) => {
                    console.error('Error generating PDF:', error);
                    addButton.style.display = 'inline-block';
                    saveButton.style.display = 'inline-block';
                    clearButton.style.display = 'inline-block';
                    commentButton.style.display = 'inline-block';
                    removeWindowButton.style.display = 'inline-block';
                    removeCommentButton.style.display = 'inline-block';
                });
            }

            function clearWindowInfo() {
                // Display a confirmation prompt
                const confirmed = confirm("Are you sure you want to clear?");
                if (confirmed) {
                    // Clear customer information fields
                    // document.getElementById('customerName').value = '';
                    // document.getElementById('orderNumber').value = '';
                    // document.getElementById('storeNumber').value = '';
                    // document.getElementById('date').value = '';
                    document.getElementById('wall').value = ''; // Clear Wall
                    document.getElementById('td').value = '';   // Clear TD
                    document.getElementById('hallaway').value = ''; // Clear Hallaway
                   
                    // document.getElementById('comm1').value = '';

                    // Clear window information fields in all sections
                    const windowSections = document.querySelectorAll('.window-container');
                    windowSections.forEach((windowSection, index) => {
                        const wallCheckbox = windowSection.querySelector('.wall');
                        const tdCheckbox = windowSection.querySelector('.td');
                        if (wallCheckbox) {
                            wallCheckbox.checked = false;
                        }
                        if (tdCheckbox) {
                            tdCheckbox.checked = false;
                        }
                    });
            
                    // Clear window information fields in all sections
        const inputFields = document.querySelectorAll('.window-container input, .window-container select');
        inputFields.forEach((field) => {
            field.value = '';
        });

        // Clear comments if the comment section exists
        const commentTextarea = document.getElementById('comments');
        if (commentTextarea) {
            commentTextarea.value = '';
        }
    } else {
        // User clicked 'Cancel,' do nothing
    }
}
            
            function createCommentSection() {
                // Check if the comment section already exists
                const existingCommentSection = document.getElementById('commentSection');

                if (!existingCommentSection) {
                    // Create a new comment section
                    const commentSection = document.createElement('section');
                    commentSection.id = 'commentSection';
                    commentSection.style.marginTop = '20px';

                    // Add a title for the comment section
                    const commentTitle = document.createElement('h2');
                    commentTitle.textContent = 'Comments';
                    commentSection.appendChild(commentTitle);

                    // Add a textarea for entering comments
                    const commentTextarea = document.createElement('textarea');
                    commentTextarea.name = 'comments';
                    commentTextarea.id = 'comments';
                    commentTextarea.rows = '1';
                    commentTextarea.style.width = '100%';
                    commentSection.appendChild(commentTextarea);

                    // Append the comment section to the form
                    const form = document.querySelector('form');
                    form.appendChild(commentSection);

                    // Show the remove button when creating the comment section
                    const removeCommentButton = document.getElementById('removeCommentButton');
                    removeCommentButton.style.display = 'inline-block';
                } else {
                    console.log('Comment section already exists.');
                }
            }

            function addPageBreak() {
                const pageBreak = document.createElement('div');
                pageBreak.className = 'page-break';
                document.body.appendChild(pageBreak);
            }
            
            function removeWindowSection() {
                // Select all window sections
                const windowSections = document.querySelectorAll('.window-container');
    
                // Check if there's more than one section left
                if (windowSections.length > 1) {
                    // Display a confirmation prompt
                    const confirmation = confirm('Are you sure you want to remove the last window section?');
                    if (confirmation) {
                        // Remove the last window section (from the bottom)
                        const lastWindowSection = windowSections[windowSections.length - 1];

                        // Decrement the "Concrete" count if the checkbox is checked
                        const wallCheckbox = lastWindowSection.querySelector('.wall');
                        if (wallCheckbox && wallCheckbox.checked) {
                            const wallInput = document.getElementById('wall');
                            wallInput.value = Math.max(parseInt(wallInput.value || 0) - 1, 0);
                        }

                        // Decrement the "T.D." count if the checkbox is checked
                        const tdCheckbox = lastWindowSection.querySelector('.td');
                        if (tdCheckbox && tdCheckbox.checked) {
                            const tdInput = document.getElementById('td');
                            tdInput.value = Math.max(parseInt(tdInput.value || 0) - 1, 0);
                        }

                        // Remove the last window section
                        lastWindowSection.remove();
                    }
                } else {
                    console.log('Cannot remove the last section.');
                }
            }

            function removeWindowSection() {
                // Select all window sections
                const windowSections = document.querySelectorAll('.window-container');
            
                // Check if there's more than one section left
                if (windowSections.length > 1) {
                    // Display a confirmation prompt
                    const confirmation = confirm('Are you sure you want to remove the last window section?');
                    if (confirmation) {
                        // Remove the last window section (from the bottom)
                        const lastWindowSection = windowSections[windowSections.length - 1];
            
                        // Decrement the "Concrete" count if the checkbox is checked
                        const wallCheckbox = lastWindowSection.querySelector('.wall');
                        if (wallCheckbox && wallCheckbox.checked) {
                            const wallInput = document.getElementById('wall');
                            wallInput.value = Math.max(parseInt(wallInput.value || 0) - 1, 0);
                        }
            
                        // Decrement the "T.D." count if the checkbox is checked
                        const tdCheckbox = lastWindowSection.querySelector('.td');
                        if (tdCheckbox && tdCheckbox.checked) {
                            const tdInput = document.getElementById('td');
                            tdInput.value = Math.max(parseInt(tdInput.value || 0) - 1, 0);
                        }
            
                        // Remove the last window section
                        lastWindowSection.remove();
            
                        // Decrement the counter
                        windowSectionCounter--;
                    }
                } else {
                    console.log('Cannot remove the last section.');
                }
            }
            

    		var today = new Date().toLocaleDateString('en-CA');
    		document.getElementById('date').value = today;
